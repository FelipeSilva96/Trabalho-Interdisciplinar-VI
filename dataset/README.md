# Dataset

As imagens não são versionadas neste repositório por causa do tamanho do conjunto de dados.

Atualmente trabalhamos com seis classes:

```text
battery
glass
metal
organic
paper
plastic
```

A pasta usada no treinamento deve seguir este formato:

```text
Base_unica/
├── battery/
├── glass/
├── metal/
├── organic/
├── paper/
└── plastic/
```

Antes do treinamento definitivo ainda serão verificadas duplicidades, distribuição entre classes, imagens inválidas e possíveis diferenças de resolução entre as duas bases consolidadas.
