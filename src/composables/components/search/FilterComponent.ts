import { onMounted, ref, computed } from 'vue';
import { useSearchStore } from '../../../store/search';
import { DEFAULT_SEARCH_QUERY_OBJ } from '../../../consts';

export const useFilterComponent = () => {
  const searchStore = useSearchStore();
  const filters = ref([
    {
      bool: 'must',
      field: 'match_all',
      op: 'query_string',
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
  };

  const updateField = (index: number) => {
    const { field } = filters.value[index];
    const computedOp = computed(() => {
      return field === '_all'
        ? 'query_string'
        : field === 'match_all'
        ? ''
        : 'match';
    });
    filters.value[index].op = computedOp.value;
    filters.value[index].value = '';
    field === 'match_all' ? updateMatchAllFilter(index) : updateFilter(index);
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
      return op === 'range' ? 'it' : 'ite';
    });
    filters.value[index].fuzzyLevel = computedFuzzyLevel.value;
    filters.value[index].rangeLevel1 = computedRangeLevel1.value;
    filters.value[index].rangeLevel2 = computedRangeLevel2.value;
    updateFilter(index);
  };

  const updateFilter = (index: number) => {
    const { bool, field, op, value } = filters.value[index];
    handleBoolChange(index);
    if (op === 'missing') {
      return handleMissingOp(index);
    }
    const newCondition: TermQuery = {
      [op]: {
        [field]: value,
      },
    };
    if (bool === 'must') {
      targetObject.query.bool.must[index] = newCondition;
    } else if (bool === 'must_not') {
      targetObject.query.bool.must_not[index] = newCondition;
    } else if (bool === 'should') {
      targetObject.query.bool.should[index] = newCondition;
    }
    setSearchQuery(targetObject);
  };

  const setSearchQuery = (targetObject: SearchQuery) => {
    const formattedTargetObject: SearchQuery = targetObject ;
    formattedTargetObject.query.bool.must = targetObject.query.bool.must.filter(item => item !== null);
    formattedTargetObject.query.bool.must_not = targetObject.query.bool.must_not.filter(item => item !== null);
    formattedTargetObject.query.bool.should = targetObject.query.bool.should.filter(item => item !== null);
    searchStore.searchQuery = JSON.stringify(formattedTargetObject);
  }

  const handleBoolChange = (index: number) => {
    targetObject.query.bool.must.splice(index, 1);
    targetObject.query.bool.must_not.splice(index, 1);
    targetObject.query.bool.should.splice(index, 1);
  }

  const handleMissingOp = (index: number) => {
    const { bool, field, op } = filters.value[index];
    if (op == 'missing') {
      const newCondition: TermQuery = {
        ['exist']: {
          field: field,
        },
      };
      if (bool === 'must') {
        targetObject.query.bool.must_not[index] = newCondition;
      } else {
        targetObject.query.bool.must[index] = newCondition;
      }
      setSearchQuery(targetObject);
    }
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
    if (bool === 'must') {
      targetObject.query.bool.must[index][op][field] = value;
    } else if (bool === 'must_not') {
      targetObject.query.bool.must_not[index][op][field] = value;
    } else if (bool === 'should') {
      targetObject.query.bool.should[index][op][field] = value;
    }
    setSearchQuery(targetObject);
  };

  const updateRangeValue = (index: number) => {
    const {
      bool,
      field,
      op,
      rangeLevel1,
      rangeLevel1Value,
      rangeLevel2,
      rangeLevel2Value,
    } = filters.value[index];
    const newCondition: TermQuery = {
      [op]: {
        [rangeLevel1]: rangeLevel1Value,
        [rangeLevel2]: rangeLevel2Value,
      },
    };
    if (bool === 'must') {
      targetObject.query.bool.must[index][op][field] = newCondition;
    } else if (bool === 'must_not') {
      targetObject.query.bool.must_not[index][op][field] = newCondition;
    } else if (bool === 'should') {
      targetObject.query.bool.should[index][op][field] = newCondition;
    }
    setSearchQuery(targetObject);
  };

  const updateFuzzyValue = (index: number) => {
    const { bool, field, op, fuzzyOp, fuzzyLevel, fuzzyLevelValue } =
      filters.value[index];
    const newCondition: TermQuery = {
      ['value']: fuzzyOp,
      [fuzzyLevel]: fuzzyLevelValue,
    };
    if (bool === 'must') {
      targetObject.query.bool.must[index][op][field] = newCondition;
    } else if (bool === 'must_not') {
      targetObject.query.bool.must_not[index][op][field] = newCondition;
    } else if (bool === 'should') {
      targetObject.query.bool.should[index][op][field] = newCondition;
    }
    setSearchQuery(targetObject);
  };

  return {
    filters,
    addFilterRow,
    removeFilterRow,
    updateFilter,
    updateValue,
    updateRangeValue,
    updateFuzzyValue,
    updateOp,
    updateField,
    allFields,
  };
};
