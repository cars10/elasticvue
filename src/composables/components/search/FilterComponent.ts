import { onMounted, ref, computed } from 'vue';
import { useSearchStore } from '../../../store/search';
import { DEFAULT_SEARCH_QUERY_OBJ } from '../../../consts';

export const useFilterComponent = () => {
  const searchStore = useSearchStore();
  const filters = ref([
    {
      bool: 'must',
      field: 'match_all',
      op: '',
      fuzzyOp: '',
      fuzzyLevel: '',
      fuzzyLevelValue: '',
      rangeLevel1: '',
      rangeLevel1Value: '',
      rangeLevel2: '',
      rangeLevel2Value: '',
      value: '',
    },
  ]);

  const operations = [
    { label: 'match', value: 'match', alwaysShow: false },
    { label: 'term', value: 'term', alwaysShow: false },
    { label: 'wildcard', value: 'wildcard', alwaysShow: false },
    { label: 'prefix', value: 'prefix', alwaysShow: false },
    { label: 'fuzzy', value: 'fuzzy', alwaysShow: false },
    { label: 'range', value: 'range', alwaysShow: false },
    { label: 'query_string', value: 'query_string', alwaysShow: true },
    { label: 'text', value: 'text', alwaysShow: false },
    { label: 'missing', value: 'missing', alwaysShow: false },
  ];

  const opOptions = ref([...operations]);

  const allFields = ref<string[]>([]);

  type TermQuery =
    | { [key: string]: { [key: string]: any } }
    | { [key: string]: any };

  interface BoolQuery {
    must: TermQuery[];
    must_not: TermQuery[];
    should: TermQuery[];
  }

  interface SearchQuery {
    query: {
      bool: BoolQuery;
    };
    size: number;
    from: number;
    sort: any[];
  }

  const targetObject: SearchQuery = {
    ...DEFAULT_SEARCH_QUERY_OBJ,
    query: {
      bool: { must: [], must_not: [], should: [] },
    },
  };

  onMounted(() => {
    searchStore.searchQuery = JSON.stringify(targetObject);
    allFields.value.push('match_all');
    allFields.value.push('_all');
    const fieldsToAdd = filterDisplayFieldName(searchStore.columns);
    allFields.value.push(...fieldsToAdd);
  });

  const filterDisplayFieldName = (columnNames: string[]) => {
    const updatedColumnNames: (string | undefined)[] = columnNames.map(
      (column) => {
        if (column.endsWith('.keyword')) {
          return column.replace(/\.keyword$/, '');
        } else if (column.startsWith('_')) {
          column;
        } else {
          return column;
        }
      }
    );
    return updatedColumnNames.filter((column) => column != undefined);
  };

  const addFilterRow = () => {
    filters.value.push({
      bool: 'must',
      field: '',
      op: 'term',
      fuzzyOp: '',
      fuzzyLevel: '',
      fuzzyLevelValue: '',
      rangeLevel1: '',
      rangeLevel1Value: '',
      rangeLevel2: '',
      rangeLevel2Value: '',
      value: '',
    });
  };

  const removeFilterRow = (index: number) => {
    filters.value.splice(index, 1);
    resetTargetObject(index);
    setSearchQuery(targetObject);
  };

  const updateField = (index: number) => {
    const { field } = filters.value[index];
    const computedOp = computed(() => {
      return updateFilterWithType(field);
    });
    filters.value[index].op = computedOp.value;
    filters.value[index].value = '';
    field === 'match_all'
      ? updateMatchAllFilter(index)
      : updateQueryString(index);
  };

  const updateQueryString = (index: number) => {
    resetTargetObject(index);
    updateMatchAllFilter(index);
  };

  const updateMatchAllFilter = (index: number) => {
    const newCondition: TermQuery = getOpCondition(index);
    updateTargetObject(index, newCondition);
    setSearchQuery(targetObject);
  };

  const updateFilterWithType = (field: string): string => {
    resetOpOptions();
  
    switch (field) {
      case '_all':
        removeItems(['match', 'term', 'wildcard', 'prefix', 'fuzzy', 'range', 'text', 'missing']);
        return 'query_string';
  
      case 'match_all':
        removeItems(['match', 'term', 'wildcard', 'prefix', 'fuzzy', 'range', 'text', 'missing', 'query_string']);
        return '';
  
      default:
        const fieldType = searchStore.allColumnProperties[field]?.type;
        if (fieldType === 'date' || fieldType === 'integer' || fieldType === 'long') {
          removeItems(['match', 'prefix', 'wildcard', 'text']);
          return 'term';
        }
        return 'match';
    }
  
    function removeItems(labels: string[]) {
      opOptions.value = opOptions.value.filter(item => !labels.includes(item.label));
    }
  
    function resetOpOptions() {
      opOptions.value = [...operations];
    }
  };

  const updateOp = (index: number) => {
    const { op } = filters.value[index];
    filters.value[index].fuzzyLevel = op === 'fuzzy' ? 'max_expansions' : 'match';
    filters.value[index].rangeLevel1 = op === 'range' ? 'gt' : 'gte';
    filters.value[index].rangeLevel2 = op === 'range' ? 'lt' : 'lte';
    updateQueryString(index);
  };

  const setSearchQuery = (targetObject: SearchQuery) => {
    const filterNonEmpty = (items: any[]) =>
      items.filter((item) => item && Object.keys(item).length > 0);
    const formattedTargetObject: SearchQuery = {
      ...targetObject,
      query: {
        ...targetObject.query,
        bool: {
          ...targetObject.query.bool,
          must: filterNonEmpty(targetObject.query.bool.must),
          must_not: filterNonEmpty(targetObject.query.bool.must_not),
          should: filterNonEmpty(targetObject.query.bool.should),
        },
      },
    };
    searchStore.searchQuery = JSON.stringify(formattedTargetObject);
  };

  const getOpCondition = (index: number) => {
    const {
      field,
      op,
      value,
      fuzzyOp,
      fuzzyLevel,
      fuzzyLevelValue,
      rangeLevel1,
      rangeLevel2,
      rangeLevel1Value,
      rangeLevel2Value,
    } = filters.value[index];
    if (op === '' || field === 'match_all') {
      return { [field]: {} };
    }
    switch (op) {
      case 'missing':
        return { exists: { field } };

      case 'query_string':
        return { query_string: { default_field: field, query: value } };

      case 'range':
        return {
          [op]: {
            [field]:
              rangeLevel1Value !== ''
                ? {
                    [rangeLevel1]: rangeLevel1Value,
                    [rangeLevel2]: rangeLevel2Value,
                  }
                : {},
          },
        };

      case 'fuzzy':
        return {
          [op]: {
            [field]:
              fuzzyLevelValue !== ''
                ? { value: fuzzyOp, [fuzzyLevel]: fuzzyLevelValue }
                : { value: fuzzyOp },
          },
        };

      default:
        return { [op]: { [field]: value } };
    }
  };

  const updateValue = (index: number) => {
    const newCondition: TermQuery = getOpCondition(index);
    updateTargetObject(index, newCondition);
    setSearchQuery(targetObject);
  };

  function updateTargetObject(index: number, newCondition: any) {
    const { bool, op } = filters.value[index];
    if (op == 'missing') {
      if (bool === 'must' || bool === 'should') {
        targetObject.query.bool.must_not[index] = newCondition;
      } else if (bool === 'must_not') {
        targetObject.query.bool.must[index] = newCondition;
      }
    } else {
      if (bool === 'must') {
        targetObject.query.bool.must[index] = newCondition;
      } else if (bool === 'must_not') {
        targetObject.query.bool.must_not[index] = newCondition;
      } else if (bool === 'should') {
        targetObject.query.bool.should[index] = newCondition;
      }
    }
  }

  function resetTargetObject(index: number) {
    targetObject.query.bool.must[index] = {};
    targetObject.query.bool.must_not[index] = {};
    targetObject.query.bool.should[index] = {};
  }

  return {
    filters,
    addFilterRow,
    removeFilterRow,
    updateQueryString,
    updateValue,
    updateOp,
    updateField,
    allFields,
    opOptions,
  };
};
