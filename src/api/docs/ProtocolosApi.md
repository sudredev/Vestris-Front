# ProtocolosApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**atualizarProtocolo**](#atualizarprotocolo) | **PUT** /api/v1/protocolos/{id} | Atualizar protocolo|
|[**buscarProtocoloPorId**](#buscarprotocoloporid) | **GET** /api/v1/protocolos/{id} | Buscar protocolo por ID|
|[**criarProtocolo**](#criarprotocolo) | **POST** /api/v1/protocolos | Criar protocolo terapêutico|
|[**deletarProtocolo**](#deletarprotocolo) | **DELETE** /api/v1/protocolos/{id} | Remover protocolo|
|[**listarProtocolosPorDoenca**](#listarprotocolospordoenca) | **GET** /api/v1/doencas/{doencaId}/protocolos | Listar protocolos de uma doença|
|[**obterProtocoloCompleto**](#obterprotocolocompleto) | **GET** /api/v1/especies/{especieId}/doencas/{doencaId}/protocolo-completo | Obter visão completa do tratamento|

# **atualizarProtocolo**
> ApiResponseProtocolo atualizarProtocolo()


### Example

```typescript
import {
    ProtocolosApi,
    Configuration,
    ProtocoloRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ProtocolosApi(configuration);

let id: string; // (default to undefined)
let protocoloRequest: ProtocoloRequest; // (optional)

const { status, data } = await apiInstance.atualizarProtocolo(
    id,
    protocoloRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **protocoloRequest** | **ProtocoloRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseProtocolo**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Atualizado |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **buscarProtocoloPorId**
> ApiResponseProtocolo buscarProtocoloPorId()


### Example

```typescript
import {
    ProtocolosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProtocolosApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buscarProtocoloPorId(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseProtocolo**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Encontrado |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **criarProtocolo**
> ApiResponseProtocolo criarProtocolo()


### Example

```typescript
import {
    ProtocolosApi,
    Configuration,
    ProtocoloRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ProtocolosApi(configuration);

let protocoloRequest: ProtocoloRequest; // (optional)

const { status, data } = await apiInstance.criarProtocolo(
    protocoloRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **protocoloRequest** | **ProtocoloRequest**|  | |


### Return type

**ApiResponseProtocolo**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Sucesso |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deletarProtocolo**
> deletarProtocolo()


### Example

```typescript
import {
    ProtocolosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProtocolosApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deletarProtocolo(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Removido |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listarProtocolosPorDoenca**
> ApiResponseListaProtocolo listarProtocolosPorDoenca()

Retorna protocolos Oficiais, Institucionais (da clínica) e Próprios (do usuário).

### Example

```typescript
import {
    ProtocolosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProtocolosApi(configuration);

let doencaId: string; // (default to undefined)
let clinicaId: string; // (optional) (default to undefined)
let usuarioId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.listarProtocolosPorDoenca(
    doencaId,
    clinicaId,
    usuarioId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **doencaId** | [**string**] |  | defaults to undefined|
| **clinicaId** | [**string**] |  | (optional) defaults to undefined|
| **usuarioId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**ApiResponseListaProtocolo**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Lista |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **obterProtocoloCompleto**
> ApiResponseProtocoloCompleto obterProtocoloCompleto()

Retorna doença, protocolo, dosagens e contraindicações combinadas

### Example

```typescript
import {
    ProtocolosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProtocolosApi(configuration);

let especieId: string; // (default to undefined)
let doencaId: string; // (default to undefined)

const { status, data } = await apiInstance.obterProtocoloCompleto(
    especieId,
    doencaId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **especieId** | [**string**] |  | defaults to undefined|
| **doencaId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseProtocoloCompleto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Sucesso |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

