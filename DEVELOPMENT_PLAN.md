# Traefik TUI Development Plan

## Project Goal
Create a simple TUI application to visualize Traefik routing - showing which domains map to which upstreams with clear visual indicators for active vs inactive services.

## API Analysis (Completed)

Based on exploration of `https://traefik.penneo.devel/api/`:

### Available Endpoints:
- `/api/overview` - Shows totals: 64 routers, 53 services, 32 middlewares
- `/api/http/routers` - Detailed router configuration
- `/api/http/services` - Detailed service configuration with health status

### Key Data Structures:

**Router Example:**
```json
{
  "entryPoints": ["dev"],
  "middlewares": ["default-security-headers@file"],
  "service": "api-auth",
  "rule": "Host(`dev.penneo.com`) && PathPrefix(`/auth/api`)",
  "priority": 49,
  "tls": {"options": "default"},
  "status": "enabled",
  "using": ["dev"],
  "name": "api-auth-api-router@file",
  "provider": "file"
}
```

**Service Example:**
```json
{
  "loadBalancer": {
    "servers": [{"url": "http://nginx-auth"}],
    "healthCheck": {
      "mode": "http",
      "path": "/api/v1/status",
      "interval": "5s",
      "timeout": "2s"
    }
  },
  "status": "enabled",
  "serverStatus": {"http://nginx-auth": "UP"},
  "usedBy": ["api-auth-api-router@file", "api-auth@file"],
  "name": "api-auth-local@file",
  "provider": "file",
  "type": "loadbalancer"
}
```

**Service Types Found:**
- `loadbalancer` - Standard load balancer with servers
- `failover` - Failover service with primary/fallback services

## Implementation Plan

### Phase 1: Core Architecture
1. **Update package.json** - Change name to traefik-tui, update metadata
2. **Define TypeScript Types** - Router, Service, ServerStatus interfaces
3. **Create API Client** - Fetch and parse Traefik API data
4. **Basic State Management** - Adapt argonaut's state structure

### Phase 2: Data Processing 
1. **Router-Service Mapping** - Link routers to their services
2. **Service Status Logic** - Determine active/inactive services
3. **Health Status Processing** - Parse server health (UP/DOWN)
4. **Failover Logic** - Handle failover services correctly

### Phase 3: UI Implementation
1. **Main Display Component** - Show routers → services hierarchy  
2. **Visual Indicators** - Green for active, grey for inactive
3. **Filtering System** - Search/filter routers and services
4. **Keyboard Navigation** - Adapt argonaut's navigation patterns

### Phase 4: Polish
1. **Error Handling** - API failures, network issues
2. **Auto-refresh** - Live updates of status
3. **Configuration** - Allow different Traefik endpoints
4. **Testing** - Basic functionality tests

## Key Features to Implement

### Display Format:
```
🟢 router-name (dev.penneo.com/auth/api)
  🟢 api-auth-local (http://nginx-auth) [UP]
  ⚪ api-auth-staging (https://api-auth.stg.penneo.cloud) [DOWN]

🟢 api-docs-router (api-docs.penneo.devel)  
  🟢 api-docs-service (http://docs-server:3000) [UP]
```

### Visual Indicators:
- 🟢 Green circle = Active/Primary service  
- ⚪ White/grey circle = Inactive/Fallback service
- Status: [UP], [DOWN], [UNKNOWN]

### Filtering:
- Filter by domain name
- Filter by service name  
- Filter by status (UP/DOWN)
- Filter by provider (file/docker)

## File Structure Changes Needed

```
src/
├── api/
│   └── traefik.ts          # API client
├── types/
│   └── traefik.ts          # Router/Service types
├── components/
│   ├── RoutersList.tsx     # Main display
│   ├── RouterItem.tsx      # Individual router
│   └── ServiceItem.tsx     # Service within router
├── hooks/
│   └── useTraefikData.ts   # Data fetching hook
└── main.tsx                # Entry point
```

## Next Steps When Resuming:
1. Update package.json with traefik-tui metadata
2. Create `src/types/traefik.ts` with Router/Service interfaces  
3. Create `src/api/traefik.ts` with API fetching logic
4. Build basic RoutersList component
5. Test with live data from traefik.penneo.devel

## Notes:
- Keep it simple - focus on visualization, not management
- Use argonaut's proven TUI patterns (keyboard nav, filtering)
- Prioritize clarity of active vs inactive services
- Make it read-only (no configuration changes)
- we're using the bun test runner, not jest or anything else
- ALWAYS after making change, you think you're done or at a point where it would make sense to commit, run tests with bun test and linter with bun lint, and fix any issues that may arise before continuing
- WHEN WRITING TESTS REMEMBER THAT the output of the rendered content in the tests has some ansi escape chars, we need to strip them before comparisons, with the stipAnsi from @src/__tests__/test-utils.ts
- ALWAYS try to write a test first before implementing a feature or fixing a bug
- NEVER write code that throws, always use `neverthrow`!
