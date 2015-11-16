module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        openui5_preload: {
            component: {
                options: {
                    resources: {
                        cwd: 'webapp',
                        prefix: 'com/pr36/app'
                    },
                    dest: 'webapp',
                    compress: true
                },
                components: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-openui5');

}