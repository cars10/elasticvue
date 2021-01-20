/* eslint-disable */
export const queryKeywords = [
  'size', 'from', 'sort',
  'analyzer', 'prefix_length', 'fuzziness',
  'value', 'flags',
  'fields', 'type',
  'filter', 'boost',
  'operator', 'cutoff_frequency', 'bool', 'should', 'term', 'prefix',
  'query', 'match', 'match_phrase'
]

export const queryValues = [
  'AND', 'OR',
  'phrase', 'phrase_prefix', 'boolean',
  'ALL', 'ANYSTRING', 'COMPLEMENT', 'EMPTY', 'INTERSECTION', 'INTERVAL', 'NONE',
  'best_fields', 'most_fields', 'cross_fields', 'phrase', 'phrase_prefix',
  'none', 'max', 'sum', 'avg', 'score', 'total', 'max', 'none',
  'AUTO'
]

export const querySnippets = '# Query snippet\n\
snippet query\n\
\t"query": {\n\
\t\t${1}\n\
\t}\n\
# Querystring snippet\n\
snippet query_string\n\
\t"query_string": {\n\
\t\t"query": "${1:*}"\n\
\t}\n\
# Match query snippet\n\
snippet match\n\
\t"match": {\n\
\t\t"${1:field}": {\n\
\t\t\t"query": "${2:query}"\n\
\t\t}\n\
\t}\n\
# Match phrase query snippet\n\
snippet match_phrase\n\
\t"match_phrase": {\n\
\t\t"${1:field}": {\n\
\t\t\t"query": "${2:query}"\n\
\t\t}\n\
\t}\n\
'
