// String consts used by protocol files
// Note: these values are no longer used to produce JSON schemas; the schemas must
// be kept in sync manually.

// Docs: https://github.com/codaco/Network-Canvas/wiki/protocol.json#variable-registry
const Entity = Object.freeze({
  edge: 'edge',
  node: 'node',
});

// Docs: https://github.com/codaco/Network-Canvas/wiki/Skip-Logic
const FilterJoin = Object.freeze({
  OR: 'OR',
  AND: 'AND',
});

// Docs: https://github.com/codaco/Network-Canvas/wiki/Skip-Logic
// TODO: expected to match https://github.com/codaco/networkQuery/blob/master/predicate.js;
//       could support node syntax there, or introduce babel-node here.
const FilterOptionsOperator = Object.freeze({
  EXISTS: 'EXISTS',
  NOT_EXISTS: 'NOT_EXISTS',
  EXACTLY: 'EXACTLY',
  NOT: 'NOT',
  GREATER_THAN: 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL: 'GREATER_THAN_OR_EQUAL',
  LESS_THAN: 'LESS_THAN',
  LESS_THAN_OR_EQUAL: 'LESS_THAN_OR_EQUAL',
});

// Docs: https://github.com/codaco/Network-Canvas/wiki/Input-Types
const FormComponent = Object.freeze({
  Checkbox: 'Checkbox',
  CheckboxGroup: 'CheckboxGroup',
  Number: 'Number',
  RadioGroup: 'RadioGroup',
  Text: 'Text',
  TextArea: 'TextArea',
  Toggle: 'Toggle',
  ToggleButton: 'ToggleButton',
  ToggleButtonGroup: 'ToggleButtonGroup',
  LikertScale: 'LikertScale',
  VisualAnalogScale: 'VisualAnalogScale',
  DatePicker: 'DatePicker',
  RelativeDatePicker: 'RelativeDatePicker',
});

// Docs: https://github.com/codaco/Network-Canvas/wiki/Information-Interface#content-types
const InformationContentType = Object.freeze({
  text: 'text',
  asset: 'asset',
});

const AssetType = Object.freeze({
  image: 'image',
  video: 'video',
  audio: 'audio',
});

// Docs: https://github.com/codaco/Network-Canvas/wiki/Skip-Logic#skip-logic-api
const RuleType = Object.freeze({
  alter: 'alter',
  ego: 'ego',
  edge: 'edge',
});

// Docs: https://github.com/codaco/Network-Canvas/wiki/Skip-Logic
const SkipLogicAction = Object.freeze({
  SHOW: 'SHOW',
  SKIP: 'SKIP',
});

// Docs: https://github.com/codaco/Network-Canvas/wiki/Skip-Logic
const SkipLogicOperator = Object.freeze({
  ANY: 'ANY',
  NONE: 'NONE',
  EXACTLY: 'EXACTLY',
  NOT: 'NOT',
  GREATER_THAN: 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL: 'GREATER_THAN_OR_EQUAL',
  LESS_THAN: 'LESS_THAN',
  LESS_THAN_OR_EQUAL: 'LESS_THAN_OR_EQUAL',
});

// Docs: https://github.com/codaco/Network-Canvas/wiki#interfaces
const StageType = Object.freeze({
  NameGenerator: 'NameGenerator',
  NameGeneratorQuickAdd: 'NameGeneratorQuickAdd',
  NameGeneratorList: 'NameGeneratorList',
  NameGeneratorAutoComplete: 'NameGeneratorAutoComplete',
  Sociogram: 'Sociogram',
  Information: 'Information',
  OrdinalBin: 'OrdinalBin',
  CategoricalBin: 'CategoricalBin',
  Narrative: 'Narrative',
  AlterForm: 'AlterForm',
  EgoForm: 'EgoForm',
  AlterEdgeForm: 'AlterEdgeForm',
  DyadCensus: 'DyadCensus',
});

// Docs: https://github.com/codaco/Network-Canvas/wiki/Variable-Types
const VariableType = Object.freeze({
  boolean: 'boolean',
  text: 'text',
  number: 'number',
  datetime: 'datetime',
  ordinal: 'ordinal',
  categorical: 'categorical',
  layout: 'layout',
  location: 'location',
});

const enumValueMaps = Object.freeze({
  Entity,
  FilterJoin,
  FilterOptionsOperator,
  FormComponent,
  InformationContentType,
  AssetType,
  RuleType,
  SkipLogicAction,
  SkipLogicOperator,
  StageType,
  VariableType,
});

const enums = Object.entries(enumValueMaps).reduce((acc, [key, map]) => {
  acc[`${key}Values`] = Object.freeze(Object.values(map));
  return acc;
}, {});

// module syntax for node script compatibility
module.exports = {
  ...enumValueMaps,
  ...enums,
};
