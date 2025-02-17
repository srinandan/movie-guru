import { ai } from './genkitConfig'

import { UserProfileFlow } from './userProfileFlow'
export { UserProfileFlowPrompt } from './userProfileFlow'

import { QueryTransformFlow } from './queryTransformFlow'
export { QueryTransformPrompt } from './queryTransformFlow'

import { MovieDocFlow } from './docRetriever'

import { MovieFlow } from './movieFlow'
export { MovieFlowPrompt } from './movieFlow'

import { QualityFlow } from './verifyQualityFlow'
export {QualityFlowPrompt} from './verifyQualityFlow'

ai.startFlowServer({
    flows: [UserProfileFlow, QueryTransformFlow, MovieFlow, MovieDocFlow, QualityFlow],
  });