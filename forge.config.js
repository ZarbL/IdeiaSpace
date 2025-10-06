module.exports = {
  packagerConfig: {
    name: "IdeiaSpace Mission",
    icon: 'src/assets/logo-dark.png',
    asar: {
      unpack: "*.{node,dll}"
    },
    overwrite: true,
    // Otimizações de memória e performance
    executableName: "ideiaspace-mission",
    // Ignorar arquivos desnecessários para reduzir tamanho
    ignore: [
      /^\/\.git/,
      /^\/node_modules\/.*\/test/,
      /^\/node_modules\/.*\/tests/,
      /^\/node_modules\/.*\/\.nyc_output/,
      /^\/node_modules\/.*\/coverage/,
      /^\/node_modules\/.*\/\.github/,
      /^\/backend\/arduino-cli\/config\/downloads/,
      /^\/backend\/arduino-cli\/config\/tmp/,
      /^\/out/,
      /^\/\.env/,
      /^\/forge\.config\.js/,
      /^\/README\.md/,
      /^\/\.gitignore/,
      /^\/memory-optimization\.md/,
      /^\/cleanup-arduino-cli\.sh/
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