/**
 * ```ts
 * const context = await browser.newContext({
 * recordHar: {
 * path: 'network.har',
 * content: 'embed',      // embed = тело запросов прямо в HAR
 * mode: 'full'           // full = все запросы
 * }
 * }); - edge AI
 * 
 *   // Запись HAR
  await context.tracing.startHar({ path: 'trace.har', mode: 'full' }); - Mira AI

////////////////////// replay
  await context.routeFromHAR('network.har', {
  notFound: 'fallback'
});
 * ```
 */

// npx playwright show-trace trace.zip

