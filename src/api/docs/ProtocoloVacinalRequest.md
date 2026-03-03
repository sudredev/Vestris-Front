# ProtocoloVacinalRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**especieId** | **string** |  | [default to undefined]
**vacinaId** | **string** |  | [default to undefined]
**referenciaId** | **string** | Fonte científica ou legal que exige/recomenda esta vacina | [default to undefined]
**idadeMinimaDias** | **number** |  | [default to undefined]
**diasParaReforco** | **number** | Se nulo ou zero, é dose única | [optional] [default to undefined]
**obrigatoria** | **boolean** | Se é exigida por lei (IBAMA/MAPA) | [optional] [default to undefined]
**observacoes** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { ProtocoloVacinalRequest } from './api';

const instance: ProtocoloVacinalRequest = {
    especieId,
    vacinaId,
    referenciaId,
    idadeMinimaDias,
    diasParaReforco,
    obrigatoria,
    observacoes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
