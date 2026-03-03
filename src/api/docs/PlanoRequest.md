# PlanoRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**nome** | **string** |  | [default to undefined]
**descricao** | **string** |  | [optional] [default to undefined]
**precoMensal** | **number** |  | [optional] [default to undefined]
**precoAnual** | **number** |  | [optional] [default to undefined]
**maxVeterinarios** | **number** |  | [default to undefined]
**isCustom** | **boolean** |  | [optional] [default to undefined]
**featuresJson** | **string** | JSON contendo flags (ex: branding, api, export) | [optional] [default to undefined]

## Example

```typescript
import { PlanoRequest } from './api';

const instance: PlanoRequest = {
    nome,
    descricao,
    precoMensal,
    precoAnual,
    maxVeterinarios,
    isCustom,
    featuresJson,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
