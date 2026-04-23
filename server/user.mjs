import AWS from 'aws-sdk';
import verifier from 'google-id-token-verifier';
import * as conf from './conf.mjs';

const s3Client = new AWS.S3();

const cb = (resolve, reject) => (err, res) => {
  if (err) {
    reject(err);
  } else {
    resolve(res);
  }
};

export const getUser = id => new Promise((resolve, reject) => {
  s3Client.getObject({
    Bucket: conf.values.userBucketName,
    Key: id,
  }, cb(resolve, reject));
})
  .then(
    res => JSON.parse(res.Body.toString('utf-8')),
    (err) => {
      if (err.code !== 'NoSuchKey') {
        throw err;
      }
    },
  );

export const putUser = (id, user) => new Promise((resolve, reject) => {
  s3Client.putObject({
    Bucket: conf.values.userBucketName,
    Key: id,
    Body: JSON.stringify(user),
  }, cb(resolve, reject));
});

export const getUserFromToken = idToken => new Promise((resolve, reject) => verifier
  .verify(idToken, conf.values.googleClientId, cb(resolve, reject)))
  .then(tokenInfo => getUser(tokenInfo.sub));

export const userInfo = (req, res) => getUserFromToken(req.query.idToken)
  .then(
    user => res.send(Object.assign({
      sponsorUntil: 0,
    }, user)),
    err => res
      .status(400)
      .send(err ? err.message || err.toString() : 'invalid_token'),
  );

export const paypalIpn = (req, res, next) => Promise.resolve()
  .then(() => {
    const userId = req.body.custom;
    const paypalEmail = req.body.payer_email;
    const gross = parseFloat(req.body.mc_gross);
    let sponsorUntil;
    if (gross === 5) {
      sponsorUntil = Date.now() + (3 * 31 * 24 * 60 * 60 * 1000); // 3 months
    } else if (gross === 15) {
      sponsorUntil = Date.now() + (366 * 24 * 60 * 60 * 1000); // 1 year
    } else if (gross === 25) {
      sponsorUntil = Date.now() + (2 * 366 * 24 * 60 * 60 * 1000); // 2 years
    } else if (gross === 50) {
      sponsorUntil = Date.now() + (5 * 366 * 24 * 60 * 60 * 1000); // 5 years
    }
    if (
      req.body.receiver_email !== conf.values.paypalReceiverEmail ||
      req.body.payment_status !== 'Completed' ||
      req.body.mc_currency !== 'USD' ||
      (req.body.txn_type !== 'web_accept' && req.body.txn_type !== 'subscr_payment') ||
      !userId || !sponsorUntil
    ) {
      // Ignoring PayPal IPN
      return res.end();
    }
    // Processing PayPal IPN
    req.body.cmd = '_notify-validate';
    return fetch(conf.values.paypalUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(req.body).toString()
    }).then(response => response.text()).then(body => {
      if (body !== 'VERIFIED') {
        throw new Error('PayPal IPN unverified');
      }
    })
      .then(() => putUser(userId, {
        paypalEmail,
        sponsorUntil,
      }))
      .then(() => res.end());
  })
  .catch(next);

export const checkSponsor = (idToken) => {
  if (!conf.publicValues.allowSponsorship) {
    return Promise.resolve(true);
  }
  if (!idToken) {
    return Promise.resolve(false);
  }
  return getUserFromToken(idToken)
    .then(userInfo => userInfo && userInfo.sponsorUntil > Date.now(), () => false);
};
