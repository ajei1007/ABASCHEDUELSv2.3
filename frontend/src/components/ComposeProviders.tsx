import React from 'react';

/**
 * ComposeProviders
 *
 * This utility component composes multiple React context providers into a single wrapper.
 * Pass an array of context providers and ComposeProviders will automatically nest them,
 * helping you avoid deeply nested JSX in your app entry point or test setups.
 *
 * Usage example:
 *
 * <ComposeProviders providers={[ProviderA, ProviderB]}>
 *   <App />
 * </ComposeProviders>
 *
 * This will render:
 * <ProviderA>
 *   <ProviderB>
 *     <App />
 *   </ProviderB>
 * </ProviderA>
 *
 * Props:
 * - providers: Array of React context provider components (each must accept `children`)
 * - children: The content to be wrapped by the composed providers
 */
const ComposeProviders: React.FC<{
  providers: React.FC<{ children: React.ReactNode }>[];
  children: React.ReactNode;
}> = ({ providers, children }) => {
  // Reduce the array of providers from right to left, nesting each provider around the children
  return providers.reduceRight(
    (nestedChildren, ProviderComponent) => (
      <ProviderComponent>{nestedChildren}</ProviderComponent>
    ),
    children,
  );
};

export default ComposeProviders;
