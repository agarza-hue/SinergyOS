module.exports = {
  apps: [{
    name:        'sinergy-web',
    script:      'node_modules/.bin/next',
    args:        'start -p 3003',
    cwd:         '/root/sinergy_os/frontend',
    instances:   1,
    exec_mode:   'fork',
    autorestart: true,
    watch:       false,
    env: { NODE_ENV: 'production' },
  }],
}
