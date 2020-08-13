// Target protocol schema version. Used to determine compatibility & migration
const APP_SCHEMA_VERSION = 3;

const APP_SUPPORTED_SCHEMA_VERSIONS = ['1.0.0', 1, 2, 3];

const DEVELOPMENT_PROTOCOL_URL = 'https://github.com/complexdatacollective/development-protocol/releases/download/20200114183127-668b15b/Development.netcanvas';

const ALLOWED_MARKDOWN_TAGS = [
  'break',
  'emphasis',
  'heading',
  'link',
  'list',
  'listItem',
  'paragraph',
  'strong',
  'thematicBreak',
];

const ALLOWED_MARKDOWN_PROMPT_TAGS = [
  'paragraph',
  'emphasis',
  'strong',
];

module.exports = {
  ALLOWED_MARKDOWN_TAGS,
  ALLOWED_MARKDOWN_PROMPT_TAGS,
  APP_SCHEMA_VERSION,
  APP_SUPPORTED_SCHEMA_VERSIONS,
  DEVELOPMENT_PROTOCOL_URL,
};
