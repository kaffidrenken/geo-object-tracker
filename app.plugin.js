const {
  withProjectBuildGradle,
  withGradleProperties,
} = require("@expo/config-plugins");

/**
 * 1) Ensure Gradle knows where React Native is (fixes "path may not be null or empty string")
 * 2) Add MapLibre-required Maven repos (jitpack + maplibre)
 */
module.exports = function configPlugin(config) {
  // Add gradle.properties entries so RN CLI path is never empty
  config = withGradleProperties(config, (cfg) => {
    // location of RN relative to android/ dir
    cfg.modResults.push({
      type: "property",
      key: "reactNativeDir",
      value: "../node_modules/react-native",
    });
    cfg.modResults.push({
      type: "property",
      key: "reactNativeCliPath",
      value: "../node_modules/react-native/cli.js",
    });
    return cfg;
  });

  // Add extra Maven repos to the root build.gradle
  config = withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== "groovy") return cfg;
    let c = cfg.modResults.contents;

    // Inject into "allprojects { repositories { ... } }"
    const repoBlock = "allprojects";
    const needJitpack = !c.includes("https://jitpack.io");
    const needMapLibre = !c.includes("https://maven.maplibre.org");

    if (c.includes(repoBlock) && (needJitpack || needMapLibre)) {
      c = c.replace(/allprojects\s*{\s*repositories\s*{/, (m) => {
        let inject = m;
        if (needJitpack) inject += `\n        maven { url 'https://jitpack.io' }`;
        if (needMapLibre) inject += `\n        maven { url 'https://maven.maplibre.org' }`;
        return inject;
      });
    }

    cfg.modResults.contents = c;
    return cfg;
  });

  return config;
};
