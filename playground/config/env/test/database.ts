import path from 'path';

export default ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: path.join(
        __dirname,
        // Get out of config/env/test
        '..',
        '..',
        '..',
        // We need to go back once more to get out of the dist folder
        '..',
        env('DATABASE_TEST_FILENAME', '.tmp/test.db'),
      ),
    },
    useNullAsDefault: true,
    debug: false,
  },
});
