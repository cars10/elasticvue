<template>
  <div class="filter-section">
    <div class="q-mb-xs">For documents where:</div>
    <div
      v-for="(filter, index) in filters"
      :key="index"
      class="uiFilterBrowser-row"
    >
      <div id="filter-block">
        <select
          v-model="filter.bool"
          class="filter"
          @change="updateFilter(index)"
        >
          <option value="must">must</option>
          <option value="must_not">must not</option>
          <option value="should">should</option>
        </select>

        <select
          v-if="allFields && allFields.length > 0"
          v-model="filter.field"
          class="filter"
          @change="updateField(index)"
        >
          <option v-for="f in allFields" :key="f" :value="f">
            {{ f }}
          </option>
        </select>

        <select
          v-if="filter.field !== 'match_all'"
          v-model="filter.op"
          class="filter"
          @change="updateOp(index)"
        >
          <option v-if="filter.field !== '_all'" value="match">match</option>
          <option v-if="filter.field !== '_all'" value="term">term</option>
          <option v-if="filter.field !== '_all'" value="wildcard">wildcard</option>
          <option v-if="filter.field !== '_all'" value="prefix">prefix</option>
          <option v-if="filter.field !== '_all'" value="fuzzy">fuzzy</option>
          <option v-if="filter.field !== '_all'" value="range">range</option>
          <option value="query_string">query_string</option>
          <option v-if="filter.field !== '_all'" value="text">text</option>
          <option v-if="filter.field !== '_all'" value="missing">missing</option>
        </select>

        <!-- Handle Fuzzy -->

        <input
          v-if="filter.op === 'fuzzy'"
          id="fuzzyInput"
          v-model="filter.fuzzyOp"
          type="text"
          @input="updateFuzzyValue(index)"
        >

        <select
          v-if="filter.op === 'fuzzy'"
          v-model="filter.fuzzyLevel"
          class="filter"
          @change="updateFuzzyValue(index)"
        >
          <option value="max_expansions">max_expansions</option>
          <option value="min_similarity">min_similarity</option>
        </select>
        
        <input
          v-if="filter.op === 'fuzzy'"
          id="fuzzyInput"
          v-model="filter.fuzzyLevelValue"
          type="text"
          @input="updateFuzzyValue(index)"
        >
        <!-- ------------------------------------- -->

        <!-- Handle Range -->
        <select
          v-if="filter.op === 'range'"
          v-model="filter.rangeLevel1"
          class="filter"
          @change="updateRangeValue(index)"
        >
          <option value="gt">gt</option>
          <option value="gte">gte</option>
        </select>
        
        <input
          v-if="filter.op === 'range'"
          id="rangeInput"
          v-model="filter.rangeLevel1Value"
          type="text"
          @input="updateRangeValue(index)"
        >
        <select
          v-if="filter.op === 'range'"
          v-model="filter.rangeLevel2"
          class="filter"
          @change="updateRangeValue(index)"
        >
          <option value="it">it</option>
          <option value="ite">ite</option>
        </select>
        
        <input
          v-if="filter.op === 'range'"
          id="fuzzyInput"
          v-model="filter.rangeLevel2Value"
          type="text"
          @input="updateRangeValue(index)"
        >
        <!-- ------------------------------------- -->

        <input
          v-if="filter.field !== 'match_all' && filter.op !== 'fuzzy' && filter.op !== 'range' && filter.op !== 'missing'"
          id="valueInput"
          v-model="filter.value"
          type="text"
          class="filter"
          @input="updateValue(index)"
        >
      </div>
      <div id="filter-button-block">
        <q-btn class="filter-button" type="button" @click="addFilterRow">
          +
        </q-btn>
        <q-btn
          class="filter-button"
          type="button"
          @click="removeFilterRow(index)"
        >
          -
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFilterComponent } from '../../composables/components/search/FilterComponent.ts';

const {
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
} = useFilterComponent();
</script>

<style scoped>
.uiFilterBrowser-row {
  display: flex;
  align-items: center;
}
.filter-button {
  margin: 2px;
}
.filter {
  margin: 2px;
}
#valueInput, 
#fuzzyInput,
#rangeInput {
  padding-top: 0;
  padding-bottom: 0;
}
</style>
