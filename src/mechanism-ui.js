import {startPublicProjectStory} from './public-project-ui.js';
import {startTruthfulReportStory} from './truthful-report-ui.js';
import {startVCGStory} from './vcg-story-ui.js';

const requested=new URLSearchParams(location.search).get('case');
const lesson=window.LESSON?.id;
if(lesson==='17.1')startPublicProjectStory(requested);
else if(lesson==='17.2')startTruthfulReportStory(requested);
else if(lesson==='17.3')startVCGStory(requested);
