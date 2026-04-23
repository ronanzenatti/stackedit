import * as conf from './conf.mjs';

function getGithubToken(clientId, code) {
  return fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: conf.values.githubClientSecret,
      code,
    }).toString()
  }).then(res => res.text()).then(body => {
    const token = new URLSearchParams(body).get('access_token');
    if (token) {
      return token;
    }
    throw new Error('bad_code');
  });
}

export const githubToken = (req, res) => {
  getGithubToken(req.query.clientId, req.query.code)
    .then(
      token => res.send(token),
      err => res
        .status(400)
        .send(err ? err.message || err.toString() : 'bad_code'),
    );
};
