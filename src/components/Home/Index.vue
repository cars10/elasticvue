<template>
  <tr>
    <td>{{index.index}}</td>
    <td>{{index.health}}</td>
    <td>{{index.status}}</td>
    <td>{{index.uuid}}</td>
    <td>{{index.pri}}</td>
    <td>{{index.rep}}</td>
    <td>{{index['docs.count']}}</td>
    <td>{{index['store.size']}}</td>
    <td>{{index['pri.store.size']}}</td>
  </tr>
</template>

<script>
  export default {
    props: ['index']
  }
</script>
