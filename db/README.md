# Prekucana pitanja

Koristi se `YAML` format za prekucavanje pitanja. Za tekstualna polja podržan je `Markdown`.

## Primer
```yaml
questions:
  - question: |-
      Pitanje

      ```c
      // Kod
      ```
    index-2016: 24
    answers:
      - Odgovor 1
      - Odgovor 2
      - Odgovor 3
      - Odgovor 4
    correct-answers: [1, 2]
```
