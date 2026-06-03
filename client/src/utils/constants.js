export const DEFAULT_TEMPLATE = `public class Main {
    public static void main(String[] args) {

    }
}`;

export const STORAGE_KEYS = {
  CODE: 'cp-ide-code',
  INPUT: 'cp-ide-input',
  OUTPUT: 'cp-ide-output',
  OUTPUT_ERROR: 'cp-ide-output-error',
  OUTPUT_STATUS: 'cp-ide-output-status',
  EXECUTION_TIME: 'cp-ide-execution-time',
  TEMPLATE: 'cp-ide-default-template',
  THEME: 'cp-ide-theme',
  FONT_SIZE: 'cp-ide-font-size',
  TAB_SIZE: 'cp-ide-tab-size',
  WORD_WRAP: 'cp-ide-word-wrap',
};

export const EXECUTION_LIMITS = {
  TIME_LIMIT_MS: 10000,
  MEMORY_LIMIT_MB: 256,
};
