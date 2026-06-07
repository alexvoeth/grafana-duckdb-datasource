import React, { ChangeEvent } from 'react';
import { InlineField, InlineSwitch, Input, SecretInput, TextArea, useTheme2 } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { DuckDBDataSourceOptions, SecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<DuckDBDataSourceOptions, SecureJsonData> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const { jsonData, secureJsonFields, secureJsonData } = options;
  const theme = useTheme2();

  const onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        path: event.target.value,
      },
    });
  };

  const onInitSqlChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        initSql: event.target.value,
      },
    });
  };

  const onQuackQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        quackQuery: event.target.value,
      },
    });
  };

  const onReadOnlyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        readOnly: event.currentTarget.checked,
      },
    });
  };

  const onMaxOpenConnsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        maxOpenConns: isNaN(value) ? 0 : value,
      },
    });
  };

  // Secure field (only sent to the backend)
  const onMotherDuckTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        motherDuckToken: event.target.value,
      },
    });
  };

  const onResetMotherDuckToken = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        motherDuckToken: false,
      },
      secureJsonData: {
        motherDuckToken: '',
      },
    });
  };

  return (
    <>
      <InlineField label="Database name" labelWidth={20} interactive tooltip={'path to DuckDB file or MotherDuck database string or leave blank to use in-memory database'}>
        <Input
          id="config-editor-path"
          onChange={onPathChange}
          value={jsonData.path}
          placeholder="e.g. md:sample_data or /path/to/database.duckdb or leave blank to use in-memory database"
          width={40}
        />
      </InlineField>
      <InlineField label="Init SQL" labelWidth={20} interactive
                     tooltip={'(Optional) SQL to run when connection is established'}>
        <div style={{ width: theme.spacing(40) }}>
          <TextArea
            id="config-editor-init-sql"
            onChange={onInitSqlChange}
            value={jsonData.initSql || ''}
            placeholder="e.g. INSTALL 'httpfs'; LOAD 'httpfs';"
            rows={5}
            // Grafana defaults textareas to vertical-only resize; allow width adjustment too.
            style={{ resize: 'both' }}
          />
        </div>
      </InlineField>
      <InlineField label="Quack Query" labelWidth={20} interactive
                     tooltip={'(Optional) Remote Quack server address. When set, panel queries are routed via quack_query() instead of running locally.'}>
        <Input
          id="config-editor-quack-query"
          onChange={onQuackQueryChange}
          value={jsonData.quackQuery || ''}
          placeholder="e.g. remote.com:9494"
          width={40}
        />
      </InlineField>
      <InlineField label="Read-only" labelWidth={20} interactive
        tooltip={'Open the database without write access, so a DuckDB file keeps no write lock and other processes can still write to it. Not available for an in-memory database.'}>
        <InlineSwitch
          id="config-editor-read-only"
          value={jsonData.readOnly ?? false}
          onChange={onReadOnlyChange}
        />
      </InlineField>
      <InlineField label="Max Connections" labelWidth={20} interactive tooltip={'Maximum number of concurrent database connections (default: 25).'}>
        <Input
          id="config-editor-max-open-conns"
          type="number"
          onChange={onMaxOpenConnsChange}
          value={jsonData.maxOpenConns ?? ''}
          placeholder="25"
          width={40}
        />
      </InlineField>
      <InlineField label="MotherDuck Token" labelWidth={20} interactive tooltip={'MotherDuck Token'}>
        <SecretInput
          required
          id="config-editor-md-token"
          isConfigured={secureJsonFields.motherDuckToken}
          value={secureJsonData?.motherDuckToken}
          placeholder="Enter your MotherDuck token"
          width={40}
          onReset={onResetMotherDuckToken}
          onChange={onMotherDuckTokenChange}
        />
      </InlineField>


    </>
  );
}
