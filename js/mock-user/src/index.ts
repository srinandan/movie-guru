import { ai } from './genkitConfig'
import { MockUserFlow } from './mockUserFlow'
export { MockUserPrompt } from './mockUserFlow'

ai.startFlowServer({
  flows: [MockUserFlow],
});