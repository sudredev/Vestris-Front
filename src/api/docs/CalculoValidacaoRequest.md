# CalculoValidacaoRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**medicamentoId** | [**JsonNullableUUID**](JsonNullableUUID.md) |  | [optional] [default to undefined]
**especieId** | [**JsonNullableUUID**](JsonNullableUUID.md) |  | [optional] [default to undefined]
**peso** | **number** |  | [default to undefined]
**doseInformada** | **number** | A dose que o vet quer usar (mg/kg) | [default to undefined]
**unidadePeso** | **string** |  | [default to undefined]
**concentracaoInformada** | [**JsonNullableDouble**](JsonNullableDouble.md) |  | [optional] [default to undefined]
**doencaId** | [**JsonNullableUUID**](JsonNullableUUID.md) |  | [optional] [default to undefined]
**via** | [**JsonNullableString**](JsonNullableString.md) |  | [optional] [default to undefined]
**clinicaId** | [**JsonNullableUUID**](JsonNullableUUID.md) |  | [optional] [default to undefined]
**usuarioId** | [**JsonNullableUUID**](JsonNullableUUID.md) |  | [optional] [default to undefined]

## Example

```typescript
import { CalculoValidacaoRequest } from './api';

const instance: CalculoValidacaoRequest = {
    medicamentoId,
    especieId,
    peso,
    doseInformada,
    unidadePeso,
    concentracaoInformada,
    doencaId,
    via,
    clinicaId,
    usuarioId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
