module.exports = {
  packagerConfig: {
    name: "IdeiaSpace Mission",
    icon: 'src/assets/logo.png',
    asar: true,
    overwrite: true,
    ignore: [
      /^\/\.git/,
      /^\/node_modules/,
      /^\/out/,
      /^\/\.env/,
      /^\/forge\.config\.js/,
      /^\/README\.md/,
      /^\/\.gitignore/
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "ideiaspace_mission",
        authors: "IdeiaSpace",
        description: "Plataforma de programação em blocos para ensino aeroespacial",
        iconUrl: "https://ideiaspace.com.br/assets/logo.ico",
        setupIcon: "./assets/logo.ico"
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: "IdeiaSpace",
          homepage: "https://ideiaspace.com.br",
          categories: ["Education", "Development"],
          description: "Plataforma de programação em blocos para ensino de conceitos aeroespaciais"
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: "IdeiaSpace",
          homepage: "https://ideiaspace.com.br",
          categories: ["Education", "Development"],
          description: "Plataforma de programação em blocos para ensino de conceitos aeroespaciais"
        }
      }
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'ideiaspace',
          name: 'ideiaspace-mission'
        },
        prerelease: false,
        draft: true
      }
    }
  ]
}; 