# Módulo C++ - IdeiaSpace

## Visão Geral

O módulo C++ do IdeiaSpace permite a geração de código C++ a partir de blocos visuais usando o Blockly. Este módulo foi projetado para ser genérico e pode ser usado para gerar código C++ padrão que pode ser compilado e executado em qualquer ambiente C++.

## Arquitetura

### Estrutura de Arquivos

```
├── generators/
│   └── cpp.js              # Gerador de código C++
├── blocks/
│   └── custom_blocks.js    # Definições dos blocos customizados
├── index.html              # Interface principal
└── renderer.js             # Lógica de renderização e execução
```

### Componentes Principais

#### 1. Gerador de Código (`generators/cpp.js`)

O gerador C++ é responsável por converter os blocos visuais em código C++ executável. Ele inclui:

- **Palavras reservadas**: Lista de palavras-chave C++ que não podem ser usadas como variáveis
- **Ordem de operadores**: Define a precedência de operadores C++
- **Geradores de blocos**: Funções que convertem cada tipo de bloco em código C++

#### 2. Blocos Customizados (`blocks/custom_blocks.js`)

Define os blocos visuais específicos para funcionalidades C++:

- **Delay Block**: Pausa a execução por um tempo especificado
- **Digital Write**: Define o estado de um pino digital
- **Digital Read**: Lê o estado de um pino digital

#### 3. Interface (`index.html`)

A interface principal inclui:

- Área de trabalho do Blockly
- Exibição do código gerado
- Botão de execução
- Categorias de blocos organizadas

## Funcionalidades

### Blocos Disponíveis

#### Lógica
- **IF/ELSE**: Estruturas condicionais
- **Comparações**: Operadores de comparação (==, !=, <, >, etc.)
- **Operações Lógicas**: AND (&&), OR (||)
- **Booleanos**: true/false

#### Loops
- **Repeat**: Loop for com contador
- **While/Until**: Loops condicionais

#### Matemática
- **Números**: Valores numéricos
- **Operações Aritméticas**: +, -, *, /, ^

#### Texto
- **String**: Texto literal
- **Print**: Saída para console (std::cout)

#### Variáveis
- **Get**: Obter valor de variável
- **Set**: Definir valor de variável

#### Funções
- **Definir**: Criar funções sem retorno
- **Chamar**: Executar funções

#### Controle
- **Delay**: Pausa em millisegundos
- **Digital Write**: Controlar pino digital
- **Digital Read**: Ler pino digital

### Geração de Código

O gerador C++ produz código estruturado com:

1. **Includes**: Bibliotecas necessárias (iostream, chrono, thread, etc.)
2. **Definições**: Constantes e variáveis globais
3. **Funções**: Funções customizadas definidas pelo usuário
4. **Main**: Função principal com o código gerado

#### Exemplo de Código Gerado

```cpp
#include <iostream>
#include <chrono>
#include <thread>

void minhaFuncao() {
  std::cout << "Hello World!" << std::endl;
}

int main() {
  int contador = 0;
  
  for (int i = 0; i < 5; i++) {
    std::cout << "Iteração: " << i << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(1000));
    contador = contador + 1;
  }
  
  if (contador > 3) {
    std::cout << "Contador é maior que 3" << std::endl;
  }
  
  return 0;
}
```

## Uso

### 1. Interface Visual

1. Abra a aplicação IdeiaSpace
2. Arraste blocos da barra lateral para a área de trabalho
3. Conecte os blocos para formar a lógica desejada
4. O código C++ será gerado automaticamente na área de código

### 2. Execução

1. Clique no botão de execução (▶️)
2. O código será enviado para execução
3. O resultado será exibido na área de mensagens

### 3. Personalização

Para adicionar novos blocos:

1. **Definir o bloco** em `blocks/custom_blocks.js`:
```javascript
Blockly.Blocks['meu_bloco'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Meu Bloco")
        .appendField(new Blockly.FieldTextInput("valor"), "VALOR");
    this.setOutput(true, null);
    this.setColour(230);
  }
};
```

2. **Criar o gerador** em `generators/cpp.js`:
```javascript
Blockly.Cpp['meu_bloco'] = function(block) {
  var valor = block.getFieldValue('VALOR');
  return ['meuValor', Blockly.Cpp.ORDER_ATOMIC];
};
```

3. **Adicionar ao toolbox** em `index.html`:
```xml
<block type="meu_bloco"></block>
```

## Características Técnicas

### Palavras Reservadas

O gerador inclui uma lista abrangente de palavras reservadas C++:

- **Tipos básicos**: int, float, double, char, bool, void
- **Modificadores**: const, static, volatile, extern
- **Controle de fluxo**: if, else, for, while, switch, case
- **STL**: string, vector, map, set, iostream
- **Modern C++**: auto, nullptr, unique_ptr, shared_ptr

### Ordem de Operadores

O gerador respeita a precedência de operadores C++:

1. **Atômico**: Números, strings, variáveis
2. **Unário**: ++, --, !, ~
3. **Multiplicativo**: *, /, %
4. **Aditivo**: +, -
5. **Relacional**: <, >, <=, >=
6. **Igualdade**: ==, !=
7. **Lógico**: &&, ||
8. **Atribuição**: =, +=, -=, etc.

### Tratamento de Strings

- Strings são escapadas corretamente
- Suporte a caracteres especiais
- Compatível com std::string

### Gerenciamento de Includes

O gerador adiciona automaticamente os includes necessários:

- `<iostream>` para std::cout
- `<chrono>` e `<thread>` para delay
- Outros includes conforme necessário

## Exemplos Práticos

### Exemplo 1: Contador Simples

**Blocos:**
- Repeat (5 vezes)
- Print "Contador: "
- Print variável i
- Delay 1000ms

**Código Gerado:**
```cpp
#include <iostream>
#include <chrono>
#include <thread>

int main() {
  for (int i = 0; i < 5; i++) {
    std::cout << "Contador: " << i << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(1000));
  }
  return 0;
}
```

### Exemplo 2: Função com Condicional

**Blocos:**
- Definir função "verificarNumero"
- Se número > 10
  - Print "Maior que 10"
- Senão
  - Print "Menor ou igual a 10"
- Chamar função "verificarNumero"

**Código Gerado:**
```cpp
#include <iostream>

void verificarNumero() {
  if (numero > 10) {
    std::cout << "Maior que 10" << std::endl;
  } else {
    std::cout << "Menor ou igual a 10" << std::endl;
  }
}

int main() {
  verificarNumero();
  return 0;
}
```

## Limitações e Considerações

### Limitações Atuais

1. **Sem suporte a classes**: Apenas funções e variáveis globais
2. **Sem ponteiros**: Não há suporte a ponteiros ou referências
3. **Sem templates**: Não há suporte a templates C++
4. **Sem exceções**: Não há tratamento de exceções

### Considerações de Performance

1. **Geração de código**: O código é gerado a cada mudança no workspace
2. **Includes desnecessários**: Alguns includes podem ser incluídos mesmo quando não usados
3. **Variáveis não utilizadas**: Variáveis criadas mas não usadas podem gerar warnings

### Melhorias Futuras

1. **Análise estática**: Detectar includes desnecessários
2. **Otimização de código**: Remover código morto
3. **Suporte a classes**: Adicionar blocos para definição de classes
4. **Debugging**: Adicionar suporte a debugging visual
5. **Bibliotecas externas**: Suporte a bibliotecas populares (Boost, etc.)

## Troubleshooting

### Problemas Comuns

1. **Erro de compilação**: Verificar se todas as variáveis estão definidas
2. **Includes faltando**: Verificar se os blocos necessários estão sendo usados
3. **Palavras reservadas**: Evitar usar nomes de variáveis que são palavras-chave C++

### Debug

Para debug, verifique:

1. **Console do navegador**: Para erros JavaScript
2. **Código gerado**: Verificar se o código C++ está correto
3. **Blocos conectados**: Verificar se todos os blocos estão conectados corretamente

## Contribuição

Para contribuir com o módulo C++:

1. **Fork** o repositório
2. **Crie** uma branch para sua feature
3. **Implemente** as mudanças
4. **Teste** com diferentes cenários
5. **Documente** as mudanças
6. **Submeta** um pull request

### Padrões de Código

- Use JSDoc para documentar funções
- Siga o estilo de código existente
- Adicione testes para novas funcionalidades
- Mantenha compatibilidade com versões anteriores

## Licença

Este módulo está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes. 