module.exports = function(grunt) {

  grunt.initConfig({
    nodewebkit: {
      options: {
        version: '0.11.3',
        buildDir: './build', // Where the build version of my node-webkit app is saved
//        credits: './public/Credits.html',
        macIcns: './icon.icns', // Path to the Mac icon file
        platforms: ['win', 'linux'] // These are the platforms that we want to build
      },
      src: './**/*' // Your node-webkit app
    },
  });

  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.registerTask('default', ['nodewebkit']);

};
