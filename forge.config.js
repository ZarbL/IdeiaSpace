module.exports = {
  packagerConfig: {
    name: "IdeiaSpace Mission",
    icon: 'assets/logo-dark.png', // Ícone para Windows .ico
    asar: true, // Empacotar app em ASAR para proteção
    overwrite: true,
    platform: 'win32', // Apenas Windows
    arch: 'x64', // Arquitetura 64-bit
    executableName: "IdeiaSpace-Mission",
    
    // CRÍTICO: Backend deve ficar FORA do ASAR
    extraResources: [
      {
        from: 'backend',
        to: 'backend',
        filter: [
          '**/*',
          '!node_modules/**/*', // Backend não precisa de node_modules empacotado
          '!arduino-cli/config/downloads/**/*', // Limpar downloads temporários
          '!arduino-cli/config/tmp/**/*', // Limpar temporários
          '!arduino-cli/config/data/tmp/**/*',
          '!**/.DS_Store',
          '!**/Thumbs.db'
        ]
      }
    ],
    
    // Ignorar arquivos desnecessários no ASAR
    ignore: [
      /^\/\.git/,
      /^\/backend/, // Backend vai para extraResources
      /^\/node_modules\/.*\/test/,
      /^\/node_modules\/.*\/tests/,
      /^\/node_modules\/.*\/\.nyc_output/,
      /^\/node_modules\/.*\/coverage/,
      /^\/node_modules\/.*\/\.github/,
      /^\/out/,
      /^\/dist/,
      /^\/\.env/,
      /^\/forge\.config\.js/,
      /^\/README\.md/,
      /^\/\.gitignore/,
      /^\/memory-optimization\.md/,
      /^\/cleanup-arduino-cli\.sh/,
      /^\/script\.js/,
      /^\/upload\.js/,
      /^\/env\.example/,
      /^\/build-prepare\.js/,
      /^\/\.forge-hooks\.js/
    ],
    
    // Hook pós-cópia para ajustar permissões
    afterCopy: [
      (buildPath, electronVersion, platform, arch, callback) => {
        require('./.forge-hooks').afterCopy(buildPath, electronVersion, platform, arch, callback);
      }
    ]
  },
  rebuildConfig: {},
  makers: [
    // Instalador principal para Windows - Squirrel
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "IdeiaSpace_Mission",
        authors: "IdeiaSpace Team",
        description: "Plataforma de programação em blocos para ensino aeroespacial - Inclui Arduino CLI e bibliotecas ESP32",
        exe: "IdeiaSpace-Mission.exe",
        setupExe: "IdeiaSpace-Mission-Setup.exe",
        setupIcon: "./assets/logo-dark.ico",
        loadingGif: "./assets/installing.gif", // Adicione um GIF de instalação se tiver
        noMsi: true, // Não criar MSI, apenas .exe
        // Configurações de atualização automática (futuro)
        remoteReleases: false
      }
    },
    // ZIP portátil para Windows
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
      config: {
        // Criar versão portátil que não precisa instalação
      }
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'ZarbL', // Seu usuário GitHub
          name: 'IdeiaSpace' // Nome do repositório
        },
        prerelease: false,
        draft: true, // Criar como draft primeiro para você revisar
        generateReleaseNotes: true
      }
    }
  ],
  
  hooks: {
    // Hook para preparar build
    generateAssets: async () => {
      console.log('🔧 Preparando recursos para build...');
      const prepareBuild = require('./build-prepare');
      await prepareBuild.prepare();
    }
  }
}; 