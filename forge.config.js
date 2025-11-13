module.exports = {
  packagerConfig: {
    name: "IdeiaSpace Mission",
    icon: 'assets/logo-dark.png', // Ícone para Windows .ico
    asar: false, // DESABILITADO: Caminhos muito longos no Windows causam erro no ASAR
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
          // EXCLUIR packages e downloads (serão baixados na primeira execução)
          '!arduino-cli/config/**',
          '!config/data/packages/**',
          '!config/downloads/**',
          '!data/packages/**',
          '!downloads/**',
          // NÃO EXCLUIR node_modules! São as dependências necessárias (express, serialport, etc)
          // Backend precisa de suas dependências para funcionar
          '!test_esp32/**',
          '!**/.DS_Store',
          '!**/Thumbs.db'
        ]
      },
      // Script de setup inicial para o usuário
      {
        from: 'PRIMEIRO-SETUP.bat',
        to: 'PRIMEIRO-SETUP.bat'
      },
      // Documentação de instalação
      {
        from: 'LEIA-ME-INSTALACAO.md',
        to: 'LEIA-ME-INSTALACAO.md'
      }
    ],
    
    // Ignorar arquivos desnecessários no ASAR
    ignore: [
      /^\/\.git$/,
      /^\/\.git\//,
      /^\/\.github$/,
      /^\/\.github\//,
      /^\/backend$/, // Backend vai para extraResources
      /^\/backend\//, // Backend vai para extraResources
      /^\/backup/, // Ignorar backup
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
      /^\/build-validate\.js/,
      /^\/build-windows\.bat/,
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
    // ZIP portátil para Windows (PRINCIPAL - sem instalação necessária)
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
      config: {}
    }
    // Squirrel desabilitado temporariamente devido a problemas com caminhos longos
    // Será reabilitado quando os packages forem baixados dinamicamente
    /*
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "IdeiaSpace_Mission",
        authors: "IdeiaSpace Team",
        description: "Plataforma de programação em blocos para ensino aeroespacial",
        exe: "IdeiaSpace-Mission.exe",
        setupExe: "IdeiaSpace-Mission-Setup.exe",
        setupIcon: "./assets/logo-dark.ico",
        noMsi: true,
        remoteReleases: false
      }
    }
    */
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