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
    const fieldsToAdd = filterDisplayFieldName(searchStore.visibleColumns);
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
    targetObject.query.bool.must[index] = {};
    targetObject.query.bool.must_not[index] = {};
    targetObject.query.bool.should[index] = {};
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

  const updateFilterWithType = (field: string): string => {
    resetOpOptions();
    if (field === '_all') {
      removeItemsByLabels([
        'match',
        'term',
        'wildcard',
        'prefix',
        'fuzzy',
        'range',
        'text',
        'missing',
      ]);
      return 'query_string';
    } else if (field === 'match_all') {
      removeItemsByLabels([
        'match',
        'term',
        'wildcard',
        'prefix',
        'fuzzy',
        'range',
        'text',
        'missing',
        'query_string',
      ]);
      return '';
    } else if (searchStore.allColumnProperties[field].type === 'date') {
      removeItemsByLabels(['match', 'prefix', 'wildcard', 'text']);
      return 'term';
    } else if (
      searchStore.allColumnProperties[field].type === 'integer' ||
      searchStore.allColumnProperties[field].type === 'long'
    ) {
      removeItemsByLabels(['match', 'prefix', 'wildcard', 'text']);
      return 'term';
    }
    return 'match';
    function removeItemsByLabels(labelsToRemove: string[]) {
      opOptions.value = opOptions.value.filter(
        (item) => !labelsToRemove.includes(item.label)
      );
      opOptions;
    }
    function resetOpOptions() {
      opOptions.value = [...operations];
    }
  };

  const updateOp = (index: number) => {
    const { op } = filters.value[index];
    const computedFuzzyLevel = computed(() => {
      return op === 'fuzzy' ? 'max_expansions' : 'match';
    });
    const computedRangeLevel1 = computed(() => {
      return op === 'range' ? 'gt' : 'gte';
    });
    const computedRangeLevel2 = computed(() => {
      return op === 'range' ? 'lt' : 'lte';
    });
    filters.value[index].fuzzyLevel = computedFuzzyLevel.value;
    filters.value[index].rangeLevel1 = computedRangeLevel1.value;
    filters.value[index].rangeLevel2 = computedRangeLevel2.value;
    updateQueryString(index);
  };

  const updateQueryString = (index: number) => {
    const { bool, op } = filters.value[index];
    handleBoolChange(index);
    const newCondition: TermQuery = getOpCondition(index);
    if (op === 'missing') {
      setMissingOperatorQuery();
    } else {
      setNonMissingOperatorQuery();
    }
    setSearchQuery(targetObject);

    function setNonMissingOperatorQuery() {
      if (bool === 'must') {
        targetObject.query.bool.must[index] = newCondition;
      } else if (bool === 'must_not') {
        targetObject.query.bool.must_not[index] = newCondition;
      } else if (bool === 'should') {
        targetObject.query.bool.should[index] = newCondition;
      }
    }
    function setMissingOperatorQuery() {
      if (bool === 'must' || bool === 'should') {
        targetObject.query.bool.must_not[index] = newCondition;
      } else if (bool === 'must_not') {
        targetObject.query.bool.must[index] = newCondition;
      }
    }
  };

  const setSearchQuery = (targetObject: SearchQuery) => {
    const formattedTargetObject: SearchQuery = JSON.parse(
      JSON.stringify(targetObject)
    );
    formattedTargetObject.query.bool.must = targetObject.query.bool.must.filter(
      (item) => item && Object.keys(item).length > 0
    );
    formattedTargetObject.query.bool.must_not =
      targetObject.query.bool.must_not.filter(
        (item) => item && Object.keys(item).length > 0
      );
    formattedTargetObject.query.bool.should =
      targetObject.query.bool.should.filter(
        (item) => item && Object.keys(item).length > 0
      );
    searchStore.searchQuery = JSON.stringify(formattedTargetObject);
  };

  const handleBoolChange = (index: number) => {
    targetObject.query.bool.must[index] = {};
    targetObject.query.bool.must_not[index] = {};
    targetObject.query.bool.should[index] = {};
  };

  const getOpCondition = (index: number) => {
    const { field, op, value } = filters.value[index];
    let newCondition: TermQuery = {
      [field]: {},
    };
    if (op === '') {
      return newCondition;
    }
    if (op === 'missing') {
      newCondition = {
        ['exists']: {
          field: field,
        },
      };
    } else if (op === 'query_string') {
      newCondition = {
        ['query_string']: {
          default_field: field,
          query: value,
        },
      };
    } else if (op === 'range') {
      newCondition = {
        [op]: {
          [field]: {},
        },
      };
    } else {
      newCondition = {
        [op]: {
          [field]: value,
        },
      };
    }
    return newCondition;
  };

  const updateMatchAllFilter = (index: number) => {
    const { bool, field } = filters.value[index];
    const newCondition: TermQuery = { [field]: {} };
    if (bool === 'must') {
      targetObject.query.bool.must[index] = newCondition;
    } else if (bool === 'must_not') {
      targetObject.query.bool.must_not[index] = newCondition;
    } else if (bool === 'should') {
      targetObject.query.bool.should[index] = newCondition;
    }
    setSearchQuery(targetObject);
  };

  const updateValue = (index: number) => {
    const { bool, field, op, value } = filters.value[index];
    if (op === 'query_string') {
      if (bool === 'must') {
        targetObject.query.bool.must[index]['query_string']['query'] = value;
      } else if (bool === 'must_not') {
        targetObject.query.bool.must_not[index]['query_string']['query'] =
          value;
      } else if (bool === 'should') {
        targetObject.query.bool.should[index]['query_string']['query'] = value;
      }
      setSearchQuery(targetObject);
      return;
    } else {
      updateTargetObject(index, value);
      setSearchQuery(targetObject);
    }
  };

  const updateRangeValue = (index: number) => {
    const { rangeLevel1, rangeLevel1Value, rangeLevel2, rangeLevel2Value } =
      filters.value[index];
    const newCondition: TermQuery = {
      [rangeLevel1]: rangeLevel1Value,
      [rangeLevel2]: rangeLevel2Value,
    };
    updateTargetObject(index, newCondition);
    setSearchQuery(targetObject);
  };

  const updateFuzzyValue = (index: number) => {
    const { fuzzyOp, fuzzyLevel, fuzzyLevelValue } = filters.value[index];
    let newCondition: TermQuery = {
      ['value']: fuzzyOp,
      [fuzzyLevel]: fuzzyLevelValue,
    };
    if (fuzzyLevelValue === '') {
      newCondition = {
        ['value']: fuzzyOp,
      };
    }
    updateTargetObject(index, newCondition);
    setSearchQuery(targetObject);
  };

  function updateTargetObject(index: number, newCondition: any) {
    const { bool, field, op } = filters.value[index];
    if (bool === 'must') {
      targetObject.query.bool.must[index][op][field] = newCondition;
    } else if (bool === 'must_not') {
      targetObject.query.bool.must_not[index][op][field] = newCondition;
    } else if (bool === 'should') {
      targetObject.query.bool.should[index][op][field] = newCondition;
    }
  }

  return {
    filters,
    addFilterRow,
    removeFilterRow,
    updateQueryString,
    updateValue,
    updateRangeValue,
    updateFuzzyValue,
    updateOp,
    updateField,
    allFields,
    opOptions,
  };
};
