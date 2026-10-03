const { withAppBuildGradle } = require('@expo/config-plugins');

function withAndroidDuplicatesFix(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const packagingSnippet = `
    packaging {
        resources {
            pickFirsts += ['META-INF/versions/9/OSGI-INF/MANIFEST.MF']
            excludes += ['META-INF/versions/9/OSGI-INF/MANIFEST.MF']
        }
    }
`;
      if (!config.modResults.contents.includes("META-INF/versions/9/OSGI-INF/MANIFEST.MF")) {
        config.modResults.contents = config.modResults.contents.replace(
          /android\s*{/,
          `android {${packagingSnippet}`
        );
      }
    }
    return config;
  });
}

module.exports = withAndroidDuplicatesFix;
