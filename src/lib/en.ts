import enBase from './en-base';
import { enPart2 } from './en2';

type StringsType = { [key: string]: any };
const en: StringsType = { ...enBase, ...enPart2 };

export default en;
