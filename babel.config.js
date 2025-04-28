module.exports = {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: [
      [
        'babel-plugin-react-svg',
        {
          rule: {
            include: /\.svg$/,
          },
        },
      ],
    ],
  };
  