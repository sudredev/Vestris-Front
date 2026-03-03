# AtendimentoRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**pacienteId** | **string** |  | [default to undefined]
**veterinarioId** | **string** |  | [default to undefined]
**protocoloId** | **string** |  | [optional] [default to undefined]
**dataHora** | **string** |  | [optional] [default to undefined]
**titulo** | **string** |  | [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**queixaPrincipal** | **string** |  | [optional] [default to undefined]
**historicoClinico** | **string** |  | [optional] [default to undefined]
**exameFisico** | **string** |  | [optional] [default to undefined]
**diagnostico** | **string** |  | [optional] [default to undefined]
**condutaClinica** | **string** |  | [optional] [default to undefined]
**observacoes** | **string** |  | [optional] [default to undefined]
**orientacoesManejo** | **string** | JSON stringificado contendo os 8 pilares de manejo | [optional] [default to undefined]

## Example

```typescript
import { AtendimentoRequest } from './api';

const instance: AtendimentoRequest = {
    pacienteId,
    veterinarioId,
    protocoloId,
    dataHora,
    titulo,
    status,
    queixaPrincipal,
    historicoClinico,
    exameFisico,
    diagnostico,
    condutaClinica,
    observacoes,
    orientacoesManejo,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
