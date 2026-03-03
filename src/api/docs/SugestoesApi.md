# SugestoesApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**atualizarStatusSugestao**](#atualizarstatussugestao) | **PATCH** /api/v1/sugestoes/{id}/status | Alterar status da sugestão (Admin)|
|[**listarSugestoes**](#listarsugestoes) | **GET** /api/v1/sugestoes | Listar sugestões recebidas|
|[**sugerirCalculo**](#sugerircalculo) | **POST** /api/v1/sugestoes/calculos | Sugerir novo tipo de cálculo|
|[**sugerirDoenca**](#sugerirdoenca) | **POST** /api/v1/sugestoes/doencas | Sugerir doença|
|[**sugerirEspecie**](#sugerirespecie) | **POST** /api/v1/sugestoes/especies | Sugerir nova espécie|
|[**sugerirProtocolo**](#sugerirprotocolo) | **POST** /api/v1/sugestoes/protocolos | Sugerir melhoria em protocolo|

# **atualizarStatusSugestao**
> ApiResponseSugestao atualizarStatusSugestao()


### Example

```typescript
import {
    SugestoesApi,
    Configuration,
    AtualizarStatusRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SugestoesApi(configuration);

let id: string; // (default to undefined)
let atualizarStatusRequest: AtualizarStatusRequest; // (optional)

const { status, data } = await apiInstance.atualizarStatusSugestao(
    id,
    atualizarStatusRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **atualizarStatusRequest** | **AtualizarStatusRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseSugestao**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Status atualizado |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listarSugestoes**
> ApiResponseListaSugestao listarSugestoes()

Permite filtrar por tipo (ESPECIE, DOENCA, etc) e status

### Example

```typescript
import {
    SugestoesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SugestoesApi(configuration);

let tipo: 'ESPECIE' | 'DOENCA' | 'PROTOCOLO' | 'CALCULO' | 'OUTRO'; // (optional) (default to undefined)
let status: 'PENDENTE' | 'EM_ANALISE' | 'APROVADA' | 'REJEITADA'; // (optional) (default to undefined)

const { status, data } = await apiInstance.listarSugestoes(
    tipo,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tipo** | [**&#39;ESPECIE&#39; | &#39;DOENCA&#39; | &#39;PROTOCOLO&#39; | &#39;CALCULO&#39; | &#39;OUTRO&#39;**]**Array<&#39;ESPECIE&#39; &#124; &#39;DOENCA&#39; &#124; &#39;PROTOCOLO&#39; &#124; &#39;CALCULO&#39; &#124; &#39;OUTRO&#39;>** |  | (optional) defaults to undefined|
| **status** | [**&#39;PENDENTE&#39; | &#39;EM_ANALISE&#39; | &#39;APROVADA&#39; | &#39;REJEITADA&#39;**]**Array<&#39;PENDENTE&#39; &#124; &#39;EM_ANALISE&#39; &#124; &#39;APROVADA&#39; &#124; &#39;REJEITADA&#39;>** |  | (optional) defaults to undefined|


### Return type

**ApiResponseListaSugestao**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Lista recuperada |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sugerirCalculo**
> ApiResponseSugestao sugerirCalculo()


### Example

```typescript
import {
    SugestoesApi,
    Configuration,
    SugestaoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SugestoesApi(configuration);

let sugestaoRequest: SugestaoRequest; // (optional)

const { status, data } = await apiInstance.sugerirCalculo(
    sugestaoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sugestaoRequest** | **SugestaoRequest**|  | |


### Return type

**ApiResponseSugestao**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Recebido |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sugerirDoenca**
> ApiResponseSugestao sugerirDoenca()


### Example

```typescript
import {
    SugestoesApi,
    Configuration,
    SugestaoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SugestoesApi(configuration);

let sugestaoRequest: SugestaoRequest; // (optional)

const { status, data } = await apiInstance.sugerirDoenca(
    sugestaoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sugestaoRequest** | **SugestaoRequest**|  | |


### Return type

**ApiResponseSugestao**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Recebido |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sugerirEspecie**
> ApiResponseSugestao sugerirEspecie()


### Example

```typescript
import {
    SugestoesApi,
    Configuration,
    SugestaoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SugestoesApi(configuration);

let sugestaoRequest: SugestaoRequest; // (optional)

const { status, data } = await apiInstance.sugerirEspecie(
    sugestaoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sugestaoRequest** | **SugestaoRequest**|  | |


### Return type

**ApiResponseSugestao**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Recebido |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sugerirProtocolo**
> ApiResponseSugestao sugerirProtocolo()


### Example

```typescript
import {
    SugestoesApi,
    Configuration,
    SugestaoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SugestoesApi(configuration);

let sugestaoRequest: SugestaoRequest; // (optional)

const { status, data } = await apiInstance.sugerirProtocolo(
    sugestaoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sugestaoRequest** | **SugestaoRequest**|  | |


### Return type

**ApiResponseSugestao**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Recebido |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

