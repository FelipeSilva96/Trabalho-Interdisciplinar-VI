# Exemplos da API

## Saúde do backend

```bash
curl http://localhost:8080/api/v1/health
```

## Categorias

```bash
curl http://localhost:8080/api/v1/categories
```

## Saúde dos workers

```bash
curl http://localhost:8080/api/v1/workers/health
```

## Classificação distribuída

```bash
curl -X POST "http://localhost:8080/api/v1/classifications?strategy=distributed"   -F "files=@imagem1.jpg"   -F "files=@imagem2.jpg"
```

## Classificação em um único worker

```bash
curl -X POST "http://localhost:8080/api/v1/classifications?strategy=single-worker"   -F "files=@imagem1.jpg"   -F "files=@imagem2.jpg"
```

## Comparação inicial

```bash
curl -X POST http://localhost:8080/api/v1/experiments/compare   -F "files=@imagem1.jpg"   -F "files=@imagem2.jpg"   -F "files=@imagem3.jpg"   -F "files=@imagem4.jpg"
```

A comparação inicial mede apenas o tempo observado entre uma execução em um worker e a distribuição entre todos os workers configurados. Ela ainda não substitui a metodologia experimental completa do trabalho.
