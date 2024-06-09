const express = require('express');
const path = require('path');
const app = express();

const PORT = (process.env.PORT ? process.env.PORT : 3000);

app.use((req, res, next) => {
  const forwardedProtocol = req.header('x-forwarded-proto');
  if (forwardedProtocol && forwardedProtocol !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
})

app.use((req, res, next) => {
  const { path } = req;
  const assetDirectories = ['images', 'static'];

  for (let i = 0; i < assetDirectories.length; i += 1) {
    const folder = `/${assetDirectories[i]}/`
    if (path.includes(folder)) {
      const [pre, post] = path.split(folder);
      if (pre) {
        const newPath = `${folder}${post}`;
        return res.redirect(newPath);
      }
    }
  }

  next();
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.listen(PORT);
