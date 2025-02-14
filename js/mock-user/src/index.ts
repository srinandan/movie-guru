import { ai } from './genkitConfig'
import { MockUserFlow, MockUserPrompt } from './mockUserFlow'
export { MockUserPrompt } from './mockUserFlow'

ai.startFlowServer({
  flows: [MockUserFlow, MockUserPrompt],
});