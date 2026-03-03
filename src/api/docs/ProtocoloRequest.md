# ProtocoloRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**titulo** | **string** |  | [default to undefined]
**doencaId** | [**JsonNullableUUID**](JsonNullableUUID.md) |  | [optional] [default to undefined]
**doencaTexto** | **string** |  | [optional] [default to undefined]
**referenciaId** | [**JsonNullableUUID**](JsonNullableUUID.md) |  | [optional] [default to undefined]
**referenciaTexto** | **string** |  | [optional] [default to undefined]
**observacoes** | **string** |  | [optional] [default to undefined]
**origem** | **string** |  | [optional] [default to undefined]
**autorId** | **string** |  | [optional] [default to undefined]
**clinicaId** | [**JsonNullableUUID**](JsonNullableUUID.md) |  | [optional] [default to undefined]
**dosagens** | [**Array&lt;DosagemItemRequest&gt;**](DosagemItemRequest.md) |  | [default to undefined]

## Example

```typescript
import { ProtocoloRequest } from './api';

const instance: ProtocoloRequest = {
    titulo,
    doencaId,
    doencaTexto,
    referenciaId,
    referenciaTexto,
    observacoes,
    origem,
    autorId,
    clinicaId,
    dosagens,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
