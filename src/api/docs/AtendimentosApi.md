# AtendimentosApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**agendarAtendimento**](#agendaratendimento) | **POST** /api/v1/atendimentos/agendar | Agendar novo atendimento|
|[**atualizarAtendimento**](#atualizaratendimento) | **PUT** /api/v1/atendimentos/{id} | Atualizar (Evoluir status, adicionar obs)|
|[**atualizarStatusAtendimento**](#atualizarstatusatendimento) | **PATCH** /api/v1/atendimentos/{id}/status | Alterar status do atendimento|
|[**buscarAtendimentoPorId**](#buscaratendimentoporid) | **GET** /api/v1/atendimentos/{id} | Ver detalhes|
|[**criarAtendimento**](#criaratendimento) | **POST** /api/v1/atendimentos | Registrar atendimento completo (Legado)|
|[**finalizarAtendimento**](#finalizaratendimento) | **PUT** /api/v1/atendimentos/{id}/finalizar | Finalizar atendimento (Preencher Prontuário)|
|[**listarAtendimentosPorPaciente**](#listaratendimentosporpaciente) | **GET** /api/v1/pacientes/{pacienteId}/atendimentos | Histórico clínico do paciente|
|[**listarMeusAtendimentos**](#listarmeusatendimentos) | **GET** /api/v1/atendimentos | Listar meus atendimentos (Agenda)|

# **agendarAtendimento**
> ApiResponseAtendimento agendarAtendimento()

Cria um registro com status AGENDADO. Dados clínicos não são permitidos aqui.

### Example

```typescript
import {
    AtendimentosApi,
    Configuration,
    AgendamentoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AtendimentosApi(configuration);

let agendamentoRequest: AgendamentoRequest; // (optional)

const { status, data } = await apiInstance.agendarAtendimento(
    agendamentoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **agendamentoRequest** | **AgendamentoRequest**|  | |


### Return type

**ApiResponseAtendimento**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Agendado com sucesso |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **atualizarAtendimento**
> ApiResponseAtendimento atualizarAtendimento()


### Example

```typescript
import {
    AtendimentosApi,
    Configuration,
    AtendimentoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AtendimentosApi(configuration);

let id: string; // (default to undefined)
let atendimentoRequest: AtendimentoRequest; // (optional)

const { status, data } = await apiInstance.atualizarAtendimento(
    id,
    atendimentoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **atendimentoRequest** | **AtendimentoRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseAtendimento**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **atualizarStatusAtendimento**
> ApiResponseAtendimento atualizarStatusAtendimento()


### Example

```typescript
import {
    AtendimentosApi,
    Configuration,
    AtualizarStatusAtendimentoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AtendimentosApi(configuration);

let id: string; // (default to undefined)
let atualizarStatusAtendimentoRequest: AtualizarStatusAtendimentoRequest; // (optional)

const { status, data } = await apiInstance.atualizarStatusAtendimento(
    id,
    atualizarStatusAtendimentoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **atualizarStatusAtendimentoRequest** | **AtualizarStatusAtendimentoRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseAtendimento**

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

# **buscarAtendimentoPorId**
> ApiResponseAtendimento buscarAtendimentoPorId()


### Example

```typescript
import {
    AtendimentosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AtendimentosApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buscarAtendimentoPorId(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseAtendimento**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **criarAtendimento**
> ApiResponseAtendimento criarAtendimento()


### Example

```typescript
import {
    AtendimentosApi,
    Configuration,
    AtendimentoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AtendimentosApi(configuration);

let atendimentoRequest: AtendimentoRequest; // (optional)

const { status, data } = await apiInstance.criarAtendimento(
    atendimentoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **atendimentoRequest** | **AtendimentoRequest**|  | |


### Return type

**ApiResponseAtendimento**

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

# **finalizarAtendimento**
> ApiResponseAtendimento finalizarAtendimento()

Recebe os dados clínicos e muda status para REALIZADO

### Example

```typescript
import {
    AtendimentosApi,
    Configuration,
    FinalizacaoAtendimentoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AtendimentosApi(configuration);

let id: string; // (default to undefined)
let finalizacaoAtendimentoRequest: FinalizacaoAtendimentoRequest; // (optional)

const { status, data } = await apiInstance.finalizarAtendimento(
    id,
    finalizacaoAtendimentoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **finalizacaoAtendimentoRequest** | **FinalizacaoAtendimentoRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseAtendimento**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listarAtendimentosPorPaciente**
> ApiResponseListaAtendimento listarAtendimentosPorPaciente()


### Example

```typescript
import {
    AtendimentosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AtendimentosApi(configuration);

let pacienteId: string; // (default to undefined)

const { status, data } = await apiInstance.listarAtendimentosPorPaciente(
    pacienteId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pacienteId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseListaAtendimento**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Histórico |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listarMeusAtendimentos**
> ApiResponseListaAtendimento listarMeusAtendimentos()


### Example

```typescript
import {
    AtendimentosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AtendimentosApi(configuration);

let veterinarioId: string; // (default to undefined)
let status: 'AGENDADO' | 'EM_ANDAMENTO' | 'REALIZADO' | 'CANCELADO'; // (optional) (default to undefined)
let pacienteId: string; // (optional) (default to undefined)
let dataInicio: string; // (optional) (default to undefined)
let dataFim: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.listarMeusAtendimentos(
    veterinarioId,
    status,
    pacienteId,
    dataInicio,
    dataFim
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **veterinarioId** | [**string**] |  | defaults to undefined|
| **status** | [**&#39;AGENDADO&#39; | &#39;EM_ANDAMENTO&#39; | &#39;REALIZADO&#39; | &#39;CANCELADO&#39;**]**Array<&#39;AGENDADO&#39; &#124; &#39;EM_ANDAMENTO&#39; &#124; &#39;REALIZADO&#39; &#124; &#39;CANCELADO&#39;>** |  | (optional) defaults to undefined|
| **pacienteId** | [**string**] |  | (optional) defaults to undefined|
| **dataInicio** | [**string**] |  | (optional) defaults to undefined|
| **dataFim** | [**string**] |  | (optional) defaults to undefined|


### Return type

**ApiResponseListaAtendimento**

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

