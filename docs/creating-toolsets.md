# Creating Custom Toolsets for AI-Kit

This guide will walk you through the process of creating your own custom toolsets for AI-Kit. Custom toolsets allow you to extend the functionality of AI-Kit with your own specialized tools.

## Basic Toolset Structure

A toolset in AI-Kit is made up of:

1. A set of tool functions that perform specific tasks
2. A factory function that creates and returns the toolset
3. Type definitions for inputs and outputs

Here's the basic pattern for creating a toolset:

```typescript
import { createToolSet, Tool } from '@sola-labs/ai-kit';

// Step 1: Define the tools and their implementations
const myTool: Tool = {
  name: 'myTool',
  description: 'Performs a specific task',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'First parameter' },
      param2: { type: 'number', description: 'Second parameter' },
    },
    required: ['param1'],
  },
  execute: async (params, context) => {
    // Implementation logic
    const result = await doSomethingWith(params.param1, params.param2);
    return result;
  },
};

// Step 2: Create a factory function for your toolset
export const myToolSetFactory = (config = {}) => {
  return createToolSet({
    name: 'myToolSet',
    description: 'A set of custom tools for specific tasks',
    tools: [myTool],
  });
};
```

## Complete Example: Weather Toolset

Let's create a complete example of a custom toolset for fetching weather information:

```typescript
import { createToolSet, Tool } from '@sola-labs/ai-kit';
import axios from 'axios';

// Step 1: Define types (optional but recommended)
type WeatherData = {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
};

// Step 2: Define the tool
const getWeatherTool: Tool = {
  name: 'getWeather',
  description: 'Get current weather information for a location',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'The city or location to get weather for',
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial'],
        description:
          'Temperature units (metric = Celsius, imperial = Fahrenheit)',
      },
    },
    required: ['location'],
  },
  execute: async (params, context) => {
    const { location, units = 'metric' } = params;

    try {
      // You would replace this with your actual API call
      const response = await axios.get('https://api.weather.example', {
        params: { q: location, units },
      });

      const weatherData: WeatherData = {
        temperature: response.data.main.temp,
        condition: response.data.weather[0].description,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
      };

      return weatherData;
    } catch (error) {
      throw new Error(`Failed to fetch weather: ${error.message}`);
    }
  },
};

// Step 3: Create the toolset factory
export interface WeatherToolSetConfig {
  apiKey?: string;
  cacheTime?: number;
}

export const weatherToolSetFactory = (config: WeatherToolSetConfig = {}) => {
  const { apiKey, cacheTime = 300000 } = config;

  // Set up any configuration needed
  if (apiKey) {
    axios.defaults.headers.common['X-API-Key'] = apiKey;
  }

  return createToolSet({
    name: 'weather',
    description: 'Tools for fetching weather information',
    tools: [getWeatherTool],
    // Optional: Configure caching per-toolset
    cache: cacheTime > 0,
  });
};
```

## Using Your Custom Toolset

To use your custom toolset with AI-Kit:

```typescript
import { SolaKit } from '@sola-labs/ai-kit';
import { weatherToolSetFactory } from './weatherToolSet';

// Create the weather toolset
const weatherTools = weatherToolSetFactory({
  apiKey: process.env.WEATHER_API_KEY,
});

// Add it to SolaKit
const solaKit = new SolaKit({
  model,
  toolSetFactories: [weatherTools],
});

// Use it in a query
const response = await solaKit.query({
  prompt: "What's the weather like in New York?",
});
```

## Advanced Toolset Features

### Context Awareness

Tools can access context provided in the query:

```typescript
const myContextAwareTool: Tool = {
  // ... other properties ...
  execute: async (params, context) => {
    const { userPreferences } = context;
    // Use context in your tool logic
  },
};
```

### Cost Management

You can define cost factors for your tools:

```typescript
const expensiveTool: Tool = {
  // ... other properties ...
  costFactor: 5, // 5x more expensive than the default cost
};
```

### Error Handling

Proper error handling in your tools ensures good user experience:

```typescript
execute: async (params, context) => {
  try {
    // Your tool logic
  } catch (error) {
    // Classify the error
    if (error.response?.status === 404) {
      throw new Error('Resource not found. Please check your input.');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }
};
```

## Best Practices

1. **Descriptive Names and Docs**: Use clear names and detailed descriptions
2. **Parameter Validation**: Define proper JSON schemas for parameters
3. **Error Handling**: Provide meaningful error messages
4. **Caching**: Enable caching for expensive or slow operations
5. **Testing**: Test your tools with a variety of inputs
6. **Security**: Validate inputs and sanitize outputs

## Conclusion

By creating custom toolsets, you can extend AI-Kit to work with any API or data source, making it adaptable to a wide range of use cases. The modular design allows you to mix and match both built-in and custom toolsets to create powerful AI-powered applications.

For more examples and detailed API reference, check out the [API documentation](./api-reference.md).
