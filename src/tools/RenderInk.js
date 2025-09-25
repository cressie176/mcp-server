import { transformSync } from 'esbuild';
import { Box, render as renderInk, Text } from 'ink';
import React from 'react';
import { WritableStreamBuffer } from 'stream-buffers';
import { z } from 'zod';

export function register(server) {
  server.registerTool(
    'RenderInk',
    {
      name: 'RenderInk',
      description: 'Renders an Ink template with given data using esbuild',
      inputSchema: {
        template: z.string().describe('The JSX template'),
        data: z.string().describe('The data to use in the template'),
      },
    },
    async ({ template, data }) => {
      try {
        const jsx = embedTemplate(template);
        const code = compileJsx(jsx);
        const Template = await createReactComponent(code);
        const text = renderTemplate(Template, data);
        return success(text);
      } catch (err) {
        return failure(err);
      }
    },
  );
}

function embedTemplate(template) {
  return `
    export default function Template(props) {
      return (${template});
    }`;
}

function compileJsx(jsx) {
  return transformSync(jsx, {
    loader: 'jsx',
    target: 'node20',
    format: 'esm',
  })?.code;
}

async function createReactComponent(code) {
  // Node.js data: URL imports cannot resolve ES module specifiers like "react" or "ink"
  // Global assignment required as workaround - React/Text must be available globally for dynamic import
  global.React = React;
  global.Text = Text;
  global.Box = Box;

  const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  const { default: Template } = await import(dataUrl);
  return Template;
}

function renderTemplate(Template, data) {
  const streamBuffer = new WritableStreamBuffer();

  const ink = renderInk(React.createElement(Template, JSON.parse(data)), { stdout: streamBuffer });
  ink.unmount();

  return streamBuffer.getContentsAsString('utf8').trim();
}

function success(text) {
  return {
    content: [{ type: 'text', text }],
  };
}

function failure(err) {
  return {
    content: [{ type: 'text', text: `JSX compilation error: ${err.message}` }],
  };
}
