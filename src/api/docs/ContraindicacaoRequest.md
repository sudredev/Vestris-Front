# ContraindicacaoRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**medicamentoId** | [**JsonNullableUUID**](JsonNullableUUID.md) |  | [optional] [default to undefined]
**principioAtivoId** | [**JsonNullableUUID**](JsonNullableUUID.md) |  | [optional] [default to undefined]
**especieId** | **string** |  | [default to undefined]
**referenciaId** | [**JsonNullableUUID**](JsonNullableUUID.md) |  | [optional] [default to undefined]
**referenciaTexto** | **string** |  | [optional] [default to undefined]
**gravidade** | **string** |  | [default to undefined]
**descricao** | **string** |  | [default to undefined]

## Example

```typescript
import { ContraindicacaoRequest } from './api';

const instance: ContraindicacaoRequest = {
    medicamentoId,
    principioAtivoId,
    especieId,
    referenciaId,
    referenciaTexto,
    gravidade,
    descricao,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
