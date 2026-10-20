<template>
  <div data-testid="tools-page">
    <main>
      <div class="flex justify-between items-center q-mb-md">
        <div>
          <h1 class="text-h5 q-my-none">{{ t('tools.heading') }}</h1>
          <div class="text-body2 text-grey-7 q-mt-xs">{{ t('tools.subtitle') }}</div>
        </div>
        <reload-button :action="refresh" />
      </div>

      <q-input
        v-model="searchQuery"
        outlined
        dense
        clearable
        class="tools-search q-mb-lg"
        label="Search tools"
        placeholder="Allocation, replicas, disk, read only..."
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <section v-if="shardSectionVisible" aria-labelledby="shards-allocation-heading" class="q-mb-xl">
        <h2 id="shards-allocation-heading" class="text-subtitle2 text-uppercase text-grey-7">Shards &amp; allocation</h2>
        <div class="row items-start q-col-gutter-md">
          <div v-if="isToolVisible('allocation')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="allocation"
              title="Shard allocation"
              description="Control whether Elasticsearch may allocate new or unassigned shards."
              :status="allocationStatus"
              :attention="allocationMode !== 'all'"
              :endpoints="allocationEndpoints"
              data-testid="tool-allocation"
            >
              <tool-error :state="requests.settings.value" inspect="cluster settings" />
              <template v-if="!requests.settings.value.apiError">
                <p class="q-mt-none">
                  Current: <strong>{{ allocationLabel(allocationMode) }}</strong>
                  <q-badge outline color="grey-7" class="q-ml-sm">{{ allocationSetting.source }}</q-badge>
                </p>
                <q-banner v-if="allocationMode !== 'all' && unassignedShards.length" rounded class="bg-warning text-dark q-mb-md">
                  Shard allocation is currently restricted and may be preventing {{ unassignedShards.length }} shard(s) from being
                  assigned.
                </q-banner>
                <q-option-group
                  v-model="allocationDraft"
                  :options="allocationOptions"
                  type="radio"
                  color="primary"
                  aria-label="Allocation mode"
                />
                <p class="text-caption q-mt-md">
                  Setting: <code>cluster.routing.allocation.enable</code>. Changing this affects future allocations. Existing
                  allocated shards remain assigned.
                </p>
                <div class="row q-gutter-sm">
                  <q-btn
                    color="primary"
                    :label="allocationActionLabel"
                    :loading="requests.mutation.value.loading"
                    :disable="allocationDraft === allocationMode"
                    @click="applyAllocation"
                  />
                  <q-btn
                    v-if="allocationSetting.source !== 'default'"
                    flat
                    label="Restore default"
                    :loading="requests.mutation.value.loading"
                    @click="restoreAllocation"
                  />
                </div>
              </template>
            </tool-card>
          </div>

          <div v-if="isToolVisible('drain')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="drain"
              title="Drain node"
              description="Move shards away from a node before shutting it down or removing it."
              :status="drainStatus"
              :attention="excludedNodeIds.length > 0"
              :endpoints="drainEndpoints"
              data-testid="tool-drain"
              @open="loadNodes"
            >
              <tool-error :state="requests.nodes.value" inspect="nodes" />
              <q-banner v-if="allocationMode === 'none'" rounded class="bg-warning text-dark q-mb-md">
                Allocation is disabled, so shard relocation cannot progress until allocation is restored.
              </q-banner>
              <q-banner rounded class="bg-default q-mb-md">
                Elasticvue drains nodes with allocation filtering. Elasticsearch's node shutdown API (<code
                  >PUT /_nodes/{node_id}/shutdown</code
                >) is designed for indirect use by orchestrators such as Elastic Cloud and ECK; direct use is not supported and
                may also require operator privileges.
              </q-banner>
              <q-select
                v-model="selectedNodeId"
                outlined
                emit-value
                map-options
                label="Node to drain"
                :options="drainNodeOptions"
                :disable="requests.nodes.value.loading"
              />
              <template v-if="selectedNode">
                <div class="q-mt-md text-body2">
                  <div>
                    <strong>{{ selectedNode.name }}</strong> ({{ dataNodeLabel(selectedNode.roles) }})
                  </div>
                  <div>
                    {{ selectedNode.shardCount }} shards<span v-if="selectedNode.diskUsedPercent != null"
                      >, {{ selectedNode.diskUsedPercent }}% disk used</span
                    >
                  </div>
                  <div class="text-caption">Node ID: {{ selectedNode.id }}</div>
                </div>
                <template v-if="selectedNodeExcluded">
                  <q-linear-progress rounded size="10px" class="q-my-md" :value="drainProgress" color="primary" />
                  <p>
                    Draining {{ selectedNode.name }} — shards remaining: {{ selectedNode.shardCount }} /
                    {{ selectedDrainInitial }}, relocating: {{ selectedNode.relocatingShards }}.
                  </p>
                  <q-banner v-if="selectedNode.shardCount === 0" rounded class="bg-positive text-white q-mb-md">
                    No data shards remain on this node. Elasticvue has not shut the node down.
                  </q-banner>
                  <div class="row q-gutter-sm">
                    <q-btn color="negative" outline label="Stop draining" @click="stopDrain" />
                    <q-btn
                      v-if="selectedNode.shardCount > 0 && unassignedShards.length"
                      flat
                      label="Explain allocation"
                      @click="selectFirstUnassigned"
                    />
                  </div>
                </template>
                <q-btn v-else color="primary" class="q-mt-md" label="Start drain" @click="startDrain" />
              </template>
              <p v-if="excludedNodeIds.length" class="text-caption q-mt-md">
                Existing excluded node IDs: {{ excludedNodeIds.join(', ') }}. Other exclusions will be preserved.
              </p>
            </tool-card>
          </div>

          <div v-if="isToolVisible('explain')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="explain"
              title="Explain unassigned shards"
              description="Ask Elasticsearch why a shard cannot be assigned."
              :status="unassignedShards.length ? `${unassignedShards.length} unassigned` : 'No unassigned shards'"
              :attention="unassignedShards.length > 0"
              :endpoints="explainEndpoints"
              data-testid="tool-explain"
            >
              <tool-error :state="requests.shards.value" inspect="shard state" />
              <q-banner v-if="!capabilities.allocationExplain" rounded class="bg-grey-3 text-dark">
                Allocation explain is not supported by this Elasticsearch version.
              </q-banner>
              <q-banner v-else-if="!unassignedShards.length" rounded class="bg-positive text-white">
                <q-icon name="check" class="q-mr-sm" />No unassigned shards
              </q-banner>
              <template v-else>
                <q-select
                  v-model="selectedShardKey"
                  outlined
                  emit-value
                  map-options
                  label="Unassigned shard"
                  :options="unassignedShardOptions"
                />
                <q-btn
                  color="primary"
                  class="q-mt-md"
                  label="Explain shard"
                  :loading="requests.explain.value.loading"
                  :disable="!selectedShard"
                  @click="runExplanation"
                />
                <tool-error :state="requests.explain.value" inspect="allocation explanation" />
                <div v-if="allocationSummary" class="q-mt-lg">
                  <div class="text-subtitle1 text-weight-medium">{{ allocationSummary.title }}</div>
                  <div class="text-caption">{{ explanation?.index }} [{{ explanation?.shard }}]</div>
                  <p><strong>Reason:</strong> {{ allocationSummary.reason }}</p>
                  <q-list v-if="allocationSummary.decisions.length" bordered separator>
                    <q-item v-for="(decision, index) in allocationSummary.decisions" :key="`${decision.decider}-${index}`">
                      <q-item-section>
                        <q-item-label
                          >{{ decision.decider }}<span v-if="decision.nodeName"> ({{ decision.nodeName }})</span></q-item-label
                        >
                        <q-item-label caption>{{ decision.explanation }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <q-expansion-item label="Show raw response" class="q-mt-sm">
                    <pre class="tools-json">{{ JSON.stringify(explanation, null, 2) }}</pre>
                  </q-expansion-item>
                </div>
              </template>
            </tool-card>
          </div>

          <div v-if="isToolVisible('retry')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="retry"
              title="Retry failed allocations"
              description="Retry shards that exceeded Elasticsearch's allocation retry limit."
              :status="unassignedShards.length ? `${unassignedShards.length} unassigned` : 'No unassigned shards'"
              :attention="unassignedShards.length > 0"
              :endpoints="retryEndpoints"
              data-testid="tool-retry"
            >
              <p class="q-mt-none">
                This asks Elasticsearch to retry shard allocations that previously exceeded their retry limit. Fix the underlying
                problem first.
              </p>
              <p v-if="health">
                Current cluster health: <strong>{{ health.status }}</strong
                >.
              </p>
              <q-btn
                color="primary"
                label="Retry allocations"
                :loading="requests.mutation.value.loading"
                @click="retryAllocations"
              />
            </tool-card>
          </div>

          <div v-if="isToolVisible('rebalancing')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="rebalancing"
              title="Shard rebalancing"
              description="Control whether Elasticsearch may move shards between nodes to rebalance the cluster."
              :status="rebalancingStatus"
              :attention="rebalancingMode !== 'all'"
              :endpoints="rebalancingEndpoints"
              data-testid="tool-rebalancing"
            >
              <tool-error :state="requests.settings.value" inspect="cluster settings" />
              <p class="q-mt-none">
                Rebalancing redistributes shards after topology or load changes. Restricting it can leave the cluster unevenly
                distributed.
              </p>
              <q-option-group v-model="rebalancingDraft" :options="rebalancingOptions" type="radio" color="primary" />
              <p class="text-caption q-mt-md">Setting: <code>cluster.routing.rebalance.enable</code></p>
              <div class="row q-gutter-sm">
                <q-btn
                  color="primary"
                  label="Update rebalancing"
                  :disable="rebalancingDraft === rebalancingMode"
                  @click="applyRebalancing"
                />
                <q-btn v-if="rebalancingSetting.source !== 'default'" flat label="Restore default" @click="restoreRebalancing" />
              </div>
            </tool-card>
          </div>
        </div>
      </section>

      <section v-if="indexSectionVisible" aria-labelledby="indices-heading" class="q-mb-xl">
        <h2 id="indices-heading" class="text-subtitle2 text-uppercase text-grey-7">Indices</h2>
        <div class="row items-start q-col-gutter-md">
          <div v-if="isToolVisible('blocks')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="blocks"
              title="Index write blocks"
              description="Inspect indices that are read-only or blocked from writes."
              :status="blockedUserIndices.length ? `${blockedUserIndices.length} blocked` : 'No user indices blocked'"
              :attention="blockedUserIndices.length > 0"
              :endpoints="indexBlocksEndpoints"
              data-testid="tool-blocks"
              @open="loadIndices"
            >
              <tool-error :state="requests.indices.value" inspect="index settings" />
              <template v-if="!requests.indices.value.apiError">
                <q-banner v-if="!blockedUserIndices.length" rounded class="bg-positive text-white">
                  <q-icon name="check" class="q-mr-sm" />No user indices have active write-related blocks.
                </q-banner>
                <template v-else>
                  <q-select
                    v-model="selectedBlockedIndices"
                    outlined
                    multiple
                    use-chips
                    emit-value
                    map-options
                    label="Blocked indices"
                    :options="blockedIndexOptions"
                  />
                  <q-list bordered separator class="q-mt-md">
                    <q-item v-for="index in blockedUserIndices" :key="index.name">
                      <q-item-section>
                        <q-item-label>{{ index.name }}</q-item-label>
                        <q-item-label caption>{{ index.blocks.join(', ') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <q-banner v-if="selectedHasFloodBlock" rounded class="bg-warning text-dark q-my-md">
                    Elasticsearch set <code>read_only_allow_delete</code> after flood-stage disk pressure.
                    <template v-if="diskSafeForFloodClear === false">
                      Disk usage is still above the configured threshold. Resolve disk pressure first.</template
                    >
                    <template v-else-if="diskSafeForFloodClear === true">
                      Disk usage appears recovered; Elasticsearch should normally remove this block itself.</template
                    >
                    <template v-else> Current disk safety could not be verified, so manual clearing is unavailable.</template>
                  </q-banner>
                  <div class="row q-gutter-sm q-mt-md">
                    <q-btn
                      color="primary"
                      label="Clear user write blocks"
                      :disable="!selectedUserBlockNames.length"
                      @click="clearUserBlocks"
                    />
                    <q-btn flat label="Recheck" @click="loadIndices" />
                    <q-btn
                      v-if="selectedHasFloodBlock && diskSafeForFloodClear === true"
                      color="warning"
                      text-color="dark"
                      outline
                      label="Clear recovered flood-stage block"
                      @click="clearFloodBlock"
                    />
                  </div>
                </template>
                <p class="text-caption q-mt-md">
                  System, hidden, and data-stream backing indices are excluded from bulk actions.
                </p>
              </template>
            </tool-card>
          </div>

          <div v-if="isToolVisible('replicas')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="replicas"
              title="Replicas"
              description="Change the number of replica shards on selected indices."
              :status="replicaStatus"
              :attention="singleNodeReplicaIndices.length > 0"
              :endpoints="replicaEndpoints"
              data-testid="tool-replicas"
              @open="loadIndices"
            >
              <tool-error :state="requests.indices.value" inspect="index settings" />
              <q-banner v-if="singleNodeReplicaIndices.length" rounded class="bg-warning text-dark q-mb-md">
                <strong>Single-node cluster detected.</strong> {{ singleNodeReplicaIndices.length }} user indices request replicas
                that cannot be assigned because a primary and replica cannot share a node.
                <div class="q-mt-sm">
                  <q-btn outline color="dark" label="Set affected indices to 0 replicas" @click="setSingleNodeReplicasToZero" />
                </div>
              </q-banner>
              <q-select
                v-model="selectedReplicaIndices"
                outlined
                multiple
                use-chips
                emit-value
                map-options
                label="Indices"
                :options="replicaIndexOptions"
              />
              <div class="text-caption q-mt-xs">Current: {{ selectedReplicaCurrent }}</div>
              <q-input
                v-model.number="replicaDraft"
                outlined
                type="number"
                min="0"
                step="1"
                label="Replica count"
                class="q-mt-md"
              />
              <q-banner v-if="replicaDraft === 0" rounded class="bg-warning text-dark q-my-md">
                With zero replicas, a node failure can make data unavailable and may result in data loss if no other copy exists.
              </q-banner>
              <q-btn
                color="primary"
                label="Set replicas"
                class="q-mt-md"
                :disable="!selectedReplicaIndices.length || !replicaValid"
                @click="applyReplicas"
              />
              <p class="text-caption q-mt-md">System, hidden, and data-stream backing indices are excluded.</p>
            </tool-card>
          </div>

          <div v-if="isToolVisible('refresh')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="refresh"
              title="Index refresh interval"
              description="Control how quickly newly indexed documents become visible to search."
              :status="refreshStatus"
              :attention="refreshDisabledCount > 0"
              :endpoints="refreshEndpoints"
              data-testid="tool-refresh"
              @open="loadIndices"
            >
              <tool-error :state="requests.indices.value" inspect="index settings" />
              <q-select
                v-model="selectedRefreshIndices"
                outlined
                multiple
                use-chips
                emit-value
                map-options
                label="Indices"
                :options="refreshIndexOptions"
              />
              <div class="text-caption q-mt-xs">Current: {{ selectedRefreshCurrent }}</div>
              <q-select
                v-model="refreshDraft"
                outlined
                emit-value
                map-options
                label="Refresh interval"
                class="q-mt-md"
                :options="[
                  { label: 'Elasticsearch default', value: 'default' },
                  { label: '1 second', value: '1s' },
                  { label: '5 seconds', value: '5s' },
                  { label: '30 seconds', value: '30s' },
                  { label: 'Disabled', value: '-1' },
                  { label: 'Custom', value: 'custom' }
                ]"
              />
              <q-input
                v-if="refreshDraft === 'custom'"
                v-model="refreshCustom"
                outlined
                label="Custom refresh interval"
                hint="Use an Elasticsearch time value such as 500ms or 2m."
                class="q-mt-md"
              />
              <q-banner v-if="refreshDraft === '-1'" rounded class="bg-warning text-dark q-my-md">
                With automatic refresh disabled, newly indexed documents may not appear in search until a refresh occurs. Indexing
                itself remains enabled.
              </q-banner>
              <q-btn
                color="primary"
                label="Update refresh interval"
                class="q-mt-md"
                :disable="!selectedRefreshIndices.length || !refreshValid"
                @click="applyRefreshInterval"
              />
              <p class="text-caption q-mt-md">System, hidden, and data-stream backing indices are excluded.</p>
            </tool-card>
          </div>
        </div>
      </section>

      <section v-if="diskSectionVisible" aria-labelledby="disk-recovery-heading">
        <h2 id="disk-recovery-heading" class="text-subtitle2 text-uppercase text-grey-7">Disk &amp; recovery</h2>
        <div class="row items-start q-col-gutter-md">
          <div v-if="isToolVisible('watermarks')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="watermarks"
              title="Disk watermarks"
              description="Configure allocation and flood-stage disk thresholds."
              :status="watermarkStatus"
              :attention="watermarksCustom"
              :endpoints="watermarkEndpoints"
              data-testid="tool-watermarks"
            >
              <tool-error :state="requests.settings.value" inspect="cluster settings" />
              <div v-if="highestDiskNode" class="q-mb-md">
                <div class="text-caption">Highest disk usage</div>
                <strong>{{ highestDiskNode.name }}</strong
                >: {{ highestDiskNode.diskUsedPercent }}% used<span v-if="highestDiskNode.diskAvailableBytes != null"
                  >, {{ prettyPrintByteString(highestDiskNode.diskAvailableBytes) }} available</span
                >
              </div>
              <q-input
                v-model="watermarkDraft.low"
                outlined
                label="Low watermark"
                hint="Stops allocating additional shards above this threshold."
              />
              <q-input
                v-model="watermarkDraft.high"
                outlined
                label="High watermark"
                class="q-mt-md"
                hint="Attempts to relocate shards away above this threshold."
              />
              <q-input
                v-if="capabilities.floodStage"
                v-model="watermarkDraft.flood"
                outlined
                label="Flood-stage watermark"
                class="q-mt-md"
                hint="Protects affected indices from writes at critical usage."
              />
              <q-banner v-if="!watermarkValidation.valid" rounded class="bg-negative text-white q-mt-md">
                {{ watermarkValidation.error }}
              </q-banner>
              <p v-else class="text-caption q-mt-md">
                {{
                  watermarkValidation.mode === 'percent'
                    ? 'Percentages describe used disk.'
                    : 'Byte values describe required free disk.'
                }}
              </p>
              <q-banner rounded class="bg-warning text-dark q-my-md">
                Lowering safety thresholds can allow nodes to fill further and should normally be temporary.
              </q-banner>
              <q-expansion-item label="Advanced" dense class="q-mb-md">
                <div class="q-pt-md">
                  <q-toggle
                    v-model="watermarkAdvanced.thresholdEnabled"
                    label="Enable disk allocation thresholds"
                    color="primary"
                  />
                  <q-banner v-if="!watermarkAdvanced.thresholdEnabled" rounded class="bg-negative text-white q-my-md">
                    Disabling disk thresholds removes Elasticsearch's disk-based allocation protection and can allow nodes to
                    fill.
                  </q-banner>
                  <template v-if="capabilities.maxHeadroom">
                    <q-input
                      v-model="watermarkAdvanced.lowMaxHeadroom"
                      outlined
                      label="Low max headroom"
                      hint="Optional byte value, for example 200gb."
                      class="q-mt-md"
                    />
                    <q-input
                      v-model="watermarkAdvanced.highMaxHeadroom"
                      outlined
                      label="High max headroom"
                      hint="Optional byte value, for example 150gb."
                      class="q-mt-md"
                    />
                    <q-input
                      v-model="watermarkAdvanced.floodMaxHeadroom"
                      outlined
                      label="Flood-stage max headroom"
                      hint="Optional byte value, for example 100gb."
                      class="q-mt-md"
                    />
                    <div v-if="headroomError" class="text-negative text-caption q-mt-sm">{{ headroomError }}</div>
                  </template>
                  <div v-else class="text-caption q-mt-md">
                    Max headroom settings are not supported by this Elasticsearch version.
                  </div>
                </div>
              </q-expansion-item>
              <p class="text-caption">Settings: <code>cluster.routing.allocation.disk.watermark.low/high/flood_stage</code>.</p>
              <div class="row q-gutter-sm">
                <q-btn
                  color="primary"
                  label="Update watermarks"
                  :disable="!watermarkValidation.valid || Boolean(headroomError)"
                  @click="applyWatermarks"
                />
                <q-btn v-if="watermarksCustom" flat label="Restore Elasticsearch defaults" @click="restoreWatermarks" />
              </div>
            </tool-card>
          </div>

          <div v-if="isToolVisible('recovery')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="recovery"
              title="Recovery bandwidth"
              description="Limit bandwidth used by shard and snapshot recovery."
              :status="recoveryStatus"
              :attention="!recoverySetting.effectiveValue"
              :endpoints="recoveryEndpoints"
              data-testid="tool-recovery"
            >
              <tool-error :state="requests.settings.value" inspect="cluster settings" />
              <p class="q-mt-none">
                This per-node limit keeps recovery traffic from overwhelming normal search and indexing workloads.
              </p>
              <q-input
                v-model="recoveryDraft"
                outlined
                label="Recovery limit"
                hint="Use an Elasticsearch byte rate such as 40mb, 80mb, or 1gb."
              />
              <div v-if="recoveryDraft && !recoveryValid" class="text-negative text-caption q-mt-sm">
                Enter a byte value such as 80mb.
              </div>
              <p class="text-caption q-mt-md">
                Setting: <code>indices.recovery.max_bytes_per_sec</code>. The limit applies per node.
              </p>
              <div class="row q-gutter-sm">
                <q-btn color="primary" label="Update recovery limit" :disable="!recoveryValid" @click="applyRecoveryBandwidth" />
                <q-btn
                  v-if="recoverySetting.source !== 'default'"
                  flat
                  label="Restore Elasticsearch default"
                  @click="restoreRecoveryBandwidth"
                />
              </div>
            </tool-card>
          </div>
        </div>
      </section>

      <section v-if="safetySectionVisible" aria-labelledby="safety-heading" class="q-mt-xl">
        <h2 id="safety-heading" class="text-subtitle2 text-uppercase text-grey-7">Safety</h2>
        <div class="row items-start q-col-gutter-md">
          <div v-if="isToolVisible('destructive')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="destructive"
              title="Destructive operation protection"
              description="Require explicit index names for destructive index operations."
              :status="destructiveEnabled ? 'Enabled' : 'Disabled'"
              :attention="!destructiveEnabled"
              :endpoints="destructiveEndpoints"
              data-testid="tool-destructive"
            >
              <tool-error :state="requests.settings.value" inspect="cluster settings" />
              <q-toggle
                :model-value="destructiveEnabled"
                label="Require explicit index names"
                color="positive"
                @update:model-value="setDestructiveProtection"
              />
              <p>
                When enabled, wildcard and <code>_all</code> based destructive operations are restricted. This protection is
                recommended.
              </p>
              <p class="text-caption">Setting: <code>action.destructive_requires_name</code></p>
              <q-btn
                v-if="destructiveSetting.source !== 'default'"
                flat
                label="Restore Elasticsearch default"
                @click="restoreDestructiveProtection"
              />
            </tool-card>
          </div>

          <div v-if="isToolVisible('autoCreate')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="autoCreate"
              title="Automatic index creation"
              description="Control whether indexing into a missing index may create it automatically."
              :status="autoCreateStatus"
              :attention="autoCreateMode === 'disable'"
              :endpoints="autoCreateEndpoints"
              data-testid="tool-auto-create"
            >
              <tool-error :state="requests.settings.value" inspect="cluster settings" />
              <q-option-group
                v-model="autoCreateMode"
                type="radio"
                color="primary"
                :options="[
                  { label: 'Elasticsearch default', value: 'default' },
                  { label: 'Allow all', value: 'allow' },
                  { label: 'Disable automatic creation', value: 'disable' },
                  { label: 'Custom ordered rules', value: 'custom' }
                ]"
              />
              <q-input
                v-if="autoCreateMode === 'custom'"
                v-model="autoCreateRules"
                outlined
                autogrow
                type="textarea"
                label="Ordered rules"
                hint="Example: +logs-*,+metrics-*,-temp-*,-*"
                class="q-mt-md"
              />
              <p class="text-caption q-mt-md">
                Setting: <code>action.auto_create_index</code>. Rules are evaluated in order; account for system functionality
                before restricting creation.
              </p>
              <p class="text-caption">
                Current raw value: <code>{{ autoCreateSetting.effectiveValue ?? 'Elasticsearch default' }}</code>
              </p>
              <q-btn color="primary" label="Update automatic creation" @click="applyAutoCreate" />
            </tool-card>
          </div>
        </div>
      </section>

      <section v-if="advancedSectionVisible" aria-labelledby="advanced-heading" class="q-mt-xl">
        <h2 id="advanced-heading" class="text-subtitle2 text-uppercase text-grey-7">Advanced / emergency</h2>
        <div class="row items-start q-col-gutter-md">
          <div v-if="isToolVisible('clusterWrite')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="clusterWrite"
              title="Cluster write mode"
              description="Make the entire cluster read-only during incident response or controlled maintenance."
              :status="clusterWriteMode === 'normal' ? 'Normal' : 'Read-only'"
              :attention="clusterWriteMode !== 'normal'"
              :endpoints="clusterWriteEndpoints"
              data-testid="tool-cluster-write"
            >
              <tool-error :state="requests.settings.value" inspect="cluster settings" />
              <q-banner v-if="clusterWriteMode !== 'normal'" rounded class="bg-warning text-dark q-mb-md">
                Cluster writes are currently restricted.
              </q-banner>
              <q-option-group v-model="clusterWriteDraft" type="radio" color="primary" :options="clusterWriteOptions" />
              <p class="text-caption q-mt-md">
                Settings: <code>cluster.blocks.read_only</code> and <code>cluster.blocks.read_only_allow_delete</code>.
              </p>
              <q-btn
                color="primary"
                label="Update cluster write mode"
                :disable="clusterWriteDraft === clusterWriteMode"
                @click="applyClusterWriteMode"
              />
            </tool-card>
          </div>

          <div v-if="isToolVisible('voting')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="voting"
              title="Voting configuration exclusions"
              description="Prepare master-eligible nodes for specific topology changes."
              :status="votingExclusions.length ? `${votingExclusions.length} active` : 'None configured'"
              :attention="votingExclusions.length > 0"
              :endpoints="votingEndpoints"
              data-testid="tool-voting"
              @open="loadVotingExclusions"
            >
              <tool-error :state="requests.voting.value" inspect="voting configuration exclusions" />
              <q-banner v-if="!capabilities.votingExclusions" rounded class="bg-warning text-dark">
                Voting configuration exclusions are not supported by this Elasticsearch version.
              </q-banner>
              <template v-else>
                <q-list v-if="votingExclusions.length" bordered separator class="q-mb-md">
                  <q-item v-for="exclusion in votingExclusions" :key="exclusion.node_id || exclusion.node_name">
                    <q-item-section>{{ exclusion.node_name || exclusion.node_id }}</q-item-section>
                  </q-item>
                </q-list>
                <q-select
                  v-model="selectedVotingNodeIds"
                  outlined
                  multiple
                  use-chips
                  emit-value
                  map-options
                  label="Master-eligible nodes"
                  :options="votingNodeOptions"
                />
                <q-banner rounded class="bg-warning text-dark q-my-md">
                  This is not required for every master-node removal. Use it only when removing enough master-eligible nodes that
                  automatic voting reconfiguration cannot safely handle the change.
                </q-banner>
                <div class="row q-gutter-sm">
                  <q-btn
                    color="primary"
                    label="Add voting exclusions"
                    :disable="!selectedVotingNodeIds.length"
                    @click="applyVotingExclusions"
                  />
                  <q-btn
                    v-if="votingExclusions.length"
                    color="warning"
                    text-color="dark"
                    outline
                    label="Clear exclusions"
                    @click="clearAllVotingExclusions"
                  />
                </div>
              </template>
            </tool-card>
          </div>

          <div v-if="isToolVisible('awareness')" class="col-12 col-md-6">
            <tool-card
              v-model="selectedTool"
              tool-id="awareness"
              title="Allocation awareness"
              description="Inspect zone or rack awareness used to distribute shard copies across failure domains."
              :status="awarenessAttributes.length ? `${awarenessAttributes.length} attribute(s)` : 'Not configured'"
              :attention="false"
              :endpoints="awarenessEndpoints"
              data-testid="tool-awareness"
              @open="loadNodes"
            >
              <tool-error :state="requests.settings.value" inspect="allocation awareness settings" />
              <q-banner v-if="!awarenessRows.length" rounded class="bg-default">
                No allocation awareness attributes are configured.
              </q-banner>
              <q-list v-else bordered separator>
                <q-item v-for="row in awarenessRows" :key="row.attribute">
                  <q-item-section>
                    <q-item-label>{{ row.attribute }}</q-item-label>
                    <q-item-label caption>Detected node values: {{ row.values.join(', ') || 'None detected' }}</q-item-label>
                    <q-item-label caption>Forced values: {{ row.forced || 'Not configured' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <p class="text-caption q-mt-md">
                Node attributes are configured on each node. This inspector does not edit them because changing cluster settings
                alone may leave replicas unassigned.
              </p>
            </tool-card>
          </div>
        </div>
      </section>

      <q-banner v-if="!visibleToolIds.size" rounded class="bg-default"> No tools match “{{ searchQuery }}”. </q-banner>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import {
  clusterToolIsSupported,
  clusterToolsCapabilities,
  effectiveSetting,
  indicesNeedingZeroReplicaHelper,
  nodeDrainProgress,
  parseByteValue,
  summarizeAllocationExplanation,
  userManagedIndices,
  validateWatermarks
} from '../../helpers/clusterTools.ts'
import { prettyPrintByteString } from '../../helpers/bytes.ts'
import { useConnectionStore } from '../../store/connection.ts'
import type { RequestState } from '../../composables/CallElasticsearch.ts'
import type { ToolShard } from '../../types/clusterTools.ts'
import ReloadButton from '../shared/ReloadButton.vue'
import ToolCard from './ToolCard.vue'

const ToolError = defineComponent({
  props: {
    state: { type: Object as () => RequestState, required: true },
    inspect: { type: String, required: true }
  },
  setup(props) {
    return () => {
      if (!props.state.apiError && !props.state.networkError) return null
      const message =
        props.state.status === 401 || props.state.status === 403
          ? `Your Elasticsearch user does not have permission to inspect ${props.inspect}.`
          : props.state.networkError
            ? `Could not retrieve ${props.inspect}. Check the cluster connection.`
            : `Could not retrieve ${props.inspect}. ${props.state.apiErrorMessage}`
      return h('div', { class: 'q-banner rounded-borders bg-warning text-dark q-mb-md', role: 'alert' }, message)
    }
  }
})

const t = useTranslation()
const connectionStore = useConnectionStore()
const capabilities = clusterToolsCapabilities(connectionStore.activeCluster?.version, !connectionStore.elasticsearch)
const selectedTool = ref<string | null>(null)
const allocationEndpoints = ['PUT /_cluster/settings']
const drainEndpoints = ['PUT /_cluster/settings']
const explainEndpoints = ['POST /_cluster/allocation/explain?include_disk_info=true']
const retryEndpoints = ['POST /_cluster/reroute?retry_failed=true']
const rebalancingEndpoints = ['PUT /_cluster/settings']
const indexBlocksEndpoints = ['PUT /{indices}/_settings']
const replicaEndpoints = ['PUT /{indices}/_settings']
const refreshEndpoints = ['PUT /{indices}/_settings']
const watermarkEndpoints = ['PUT /_cluster/settings']
const recoveryEndpoints = ['PUT /_cluster/settings']
const destructiveEndpoints = ['PUT /_cluster/settings']
const autoCreateEndpoints = ['PUT /_cluster/settings']
const clusterWriteEndpoints = ['PUT /_cluster/settings']
const votingEndpoints = [
  'POST /_cluster/voting_config_exclusions?node_ids={node_ids}',
  'DELETE /_cluster/voting_config_exclusions?wait_for_removal=true'
]
const awarenessEndpoints: string[] = []
const searchQuery = ref<string | null>('')
const toolSearchContent: Record<string, string> = {
  allocation: ['Shard allocation', 'allocate primary replica maintenance', ...allocationEndpoints].join(' '),
  drain: ['Drain node', 'shutdown remove maintenance exclude relocation', ...drainEndpoints].join(' '),
  explain: ['Explain unassigned shards', 'allocation diagnostic deciders', ...explainEndpoints].join(' '),
  retry: ['Retry failed allocations', 'reroute retry limit', ...retryEndpoints].join(' '),
  rebalancing: ['Shard rebalancing', 'move redistribution topology', ...rebalancingEndpoints].join(' '),
  blocks: ['Index write blocks', 'read only flood stage writable', ...indexBlocksEndpoints].join(' '),
  replicas: ['Replicas', 'redundancy single node replica count', ...replicaEndpoints].join(' '),
  refresh: ['Index refresh interval', 'search visibility bulk indexing disabled', ...refreshEndpoints].join(' '),
  watermarks: ['Disk watermarks', 'disk free used flood threshold headroom', ...watermarkEndpoints].join(' '),
  recovery: ['Recovery bandwidth', 'shard snapshot traffic bytes per second', ...recoveryEndpoints].join(' '),
  destructive: ['Destructive operation protection', 'wildcard delete explicit names safety', ...destructiveEndpoints].join(' '),
  autoCreate: ['Automatic index creation', 'missing index patterns rules', ...autoCreateEndpoints].join(' '),
  clusterWrite: ['Cluster write mode', 'read only emergency maintenance', ...clusterWriteEndpoints].join(' '),
  voting: ['Voting configuration exclusions', 'master eligible topology removal', ...votingEndpoints].join(' '),
  awareness: ['Allocation awareness', 'zone rack attributes failure domain', ...awarenessEndpoints].join(' ')
}
const visibleToolIds = computed(() => {
  const terms = (searchQuery.value || '').trim().toLowerCase().split(/\s+/).filter(Boolean)
  return new Set(
    Object.entries(toolSearchContent)
      .filter(
        ([id, content]) => clusterToolIsSupported(id, capabilities) && terms.every((term) => content.toLowerCase().includes(term))
      )
      .map(([id]) => id)
  )
})
const isToolVisible = (id: string) => visibleToolIds.value.has(id)
const shardSectionVisible = computed(() =>
  ['allocation', 'drain', 'explain', 'retry', 'rebalancing'].some((id) => visibleToolIds.value.has(id))
)
const indexSectionVisible = computed(() => ['blocks', 'replicas', 'refresh'].some((id) => visibleToolIds.value.has(id)))
const diskSectionVisible = computed(() => ['watermarks', 'recovery'].some((id) => visibleToolIds.value.has(id)))
const safetySectionVisible = computed(() => ['destructive', 'autoCreate'].some((id) => visibleToolIds.value.has(id)))
const advancedSectionVisible = computed(() => ['clusterWrite', 'voting', 'awareness'].some((id) => visibleToolIds.value.has(id)))
const {
  settings,
  nodes,
  indices,
  health,
  explanation,
  votingExclusions,
  unassignedShards,
  dataNodeCount,
  excludedNodeIds,
  requests,
  loadShards,
  loadNodes,
  loadIndices,
  loadVotingExclusions,
  refresh,
  setAllocation,
  setClusterSettings,
  explainShard,
  retryFailed,
  setNodeDrain,
  clearIndexBlocks,
  setReplicas,
  setRefreshInterval,
  addVotingExclusions,
  clearVotingExclusions,
  setWatermarks
} = useClusterTools()

const allocationOptions = [
  { label: 'All shards — normal primary and replica allocation', value: 'all' },
  { label: 'Primaries only — replicas will not be newly allocated', value: 'primaries' },
  { label: 'New primaries only — advanced maintenance restriction', value: 'new_primaries' },
  { label: 'Disabled — no new shard allocations', value: 'none' }
]
const allocationSetting = computed(() => effectiveSetting<string>(settings.value, 'cluster.routing.allocation.enable', 'all'))
const allocationMode = computed(() => allocationSetting.value.effectiveValue || 'all')
const allocationDraft = ref('all')
watch(allocationMode, (value) => (allocationDraft.value = value), { immediate: true })
const allocationLabel = (value: string) =>
  ({ all: 'All shards', primaries: 'Primaries only', new_primaries: 'New primaries only', none: 'Disabled' })[value] || value
const allocationStatus = computed(() => (allocationMode.value === 'all' ? 'Normal' : allocationLabel(allocationMode.value)))
const allocationActionLabel = computed(() =>
  allocationDraft.value === 'none' ? 'Disable allocation' : `Set ${allocationLabel(allocationDraft.value).toLowerCase()}`
)

const applyAllocation = async () => {
  const effect =
    allocationDraft.value === 'none'
      ? 'No new shard allocations will occur. Existing allocated shards remain assigned.'
      : `Future shard allocation will be limited to ${allocationLabel(allocationDraft.value).toLowerCase()}.`
  if (
    allocationDraft.value !== 'all' &&
    !(await askConfirm(`Change shard allocation from ${allocationMode.value} to ${allocationDraft.value}?\n\n${effect}`))
  )
    return
  await setAllocation(allocationDraft.value)
}
const restoreAllocation = async () => {
  if (await askConfirm('Restore shard allocation to the Elasticsearch default by removing the persistent override?')) {
    await setAllocation(null)
  }
}

const rebalancingSetting = computed(() => effectiveSetting<string>(settings.value, 'cluster.routing.rebalance.enable', 'all'))
const rebalancingMode = computed(() => rebalancingSetting.value.effectiveValue || 'all')
const rebalancingDraft = ref('all')
watch(rebalancingMode, (value) => (rebalancingDraft.value = value), { immediate: true })
const rebalancingOptions = [
  { label: 'All shards — normal rebalancing', value: 'all' },
  { label: 'Primaries only', value: 'primaries' },
  { label: 'Replicas only', value: 'replicas' },
  { label: 'Disabled', value: 'none' }
]
const rebalancingStatus = computed(() => {
  if (rebalancingMode.value === 'all') return 'Normal'
  if (rebalancingMode.value === 'none') return 'Disabled'
  return `${rebalancingMode.value} only`
})
const applyRebalancing = async () => {
  if (
    rebalancingDraft.value !== 'all' &&
    !(await askConfirm(
      `Restrict shard rebalancing to ${rebalancingDraft.value}?\n\nThe cluster may remain unevenly distributed after topology changes.`
    ))
  )
    return
  await setClusterSettings(
    { 'cluster.routing.rebalance.enable': rebalancingDraft.value },
    `Shard rebalancing set to ${rebalancingDraft.value}.`
  )
}
const restoreRebalancing = async () => {
  if (await askConfirm('Restore shard rebalancing to the Elasticsearch default?')) {
    await setClusterSettings({ 'cluster.routing.rebalance.enable': null }, 'Shard rebalancing restored to default.')
  }
}

const selectedNodeId = ref<string | null>(null)
const drainInitial = reactive<Record<string, number>>({})
const selectedNode = computed(() => nodes.value.find((node) => node.id === selectedNodeId.value) || null)
const selectedNodeExcluded = computed(() => Boolean(selectedNodeId.value && excludedNodeIds.value.includes(selectedNodeId.value)))
const selectedDrainInitial = computed(() =>
  selectedNode.value
    ? drainInitial[selectedNode.value.id] || Math.max(selectedNode.value.initialShardCount, selectedNode.value.shardCount)
    : 0
)
const drainProgress = computed(() => {
  if (!selectedNode.value) return 0
  return nodeDrainProgress(selectedDrainInitial.value, selectedNode.value.shardCount)
})
const drainNodeOptions = computed(() =>
  nodes.value
    .filter((node) => node.shardCount > 0 || excludedNodeIds.value.includes(node.id))
    .map((node) => ({ label: `${node.name} (${node.shardCount} shards)`, value: node.id }))
)
const drainStatus = computed(() =>
  excludedNodeIds.value.length ? `${excludedNodeIds.value.length} excluded` : 'No active drain'
)
const dataNodeLabel = (roles: string[]) =>
  roles.some((role) => role === 'data' || role.startsWith('data_')) ? 'Data node' : roles.join(', ') || 'Node'
const startDrain = async () => {
  if (!selectedNode.value) return
  const node = selectedNode.value
  const confirmation = `Start draining ${node.name}?\n\nElasticsearch will exclude node ID ${node.id} from shard allocation and move eligible shards away. Other allocation exclusions will be preserved. This does not shut down the node.`
  if (!(await askConfirm(confirmation))) return
  drainInitial[node.id] = node.shardCount
  await setNodeDrain(node.id, true)
}
const stopDrain = async () => {
  if (!selectedNode.value) return
  const node = selectedNode.value
  if (!(await askConfirm(`Stop draining ${node.name}?\n\nOnly node ID ${node.id} will be removed from allocation exclusions.`)))
    return
  await setNodeDrain(node.id, false)
}

let drainTimer: ReturnType<typeof setInterval> | null = null
watch(
  selectedNodeExcluded,
  (active) => {
    if (drainTimer) clearInterval(drainTimer)
    drainTimer = active
      ? setInterval(() => {
          void loadShards().then(loadNodes)
        }, 5000)
      : null
  },
  { immediate: true }
)

const shardKey = (shard: ToolShard) => `${shard.index}:${shard.shard}:${shard.prirep}`
const selectedShardKey = ref<string | null>(null)
const selectedShard = computed(() => unassignedShards.value.find((shard) => shardKey(shard) === selectedShardKey.value) || null)
const unassignedShardOptions = computed(() =>
  unassignedShards.value.map((shard) => ({
    label: `${shard.index} [${shard.shard}] (${shard.prirep === 'p' ? 'primary' : 'replica'})`,
    value: shardKey(shard)
  }))
)
const allocationSummary = computed(() =>
  explanation.value ? summarizeAllocationExplanation(explanation.value, dataNodeCount.value) : null
)
const runExplanation = async () => {
  if (selectedShard.value) await explainShard(selectedShard.value)
}
const selectFirstUnassigned = () => {
  const first = unassignedShards.value[0]
  if (first) selectedShardKey.value = shardKey(first)
}
watch(unassignedShards, (value) => {
  if (!selectedShardKey.value && value.length) selectedShardKey.value = shardKey(value[0])
})
const retryAllocations = async () => {
  if (
    await askConfirm(
      `Retry failed shard allocations?\n\nElasticsearch will retry allocations that exceeded their retry limit. ${unassignedShards.value.length} shard(s) are currently unassigned; this will not fix an unresolved underlying problem.`
    )
  ) {
    await retryFailed()
  }
}

const userIndices = computed(() => userManagedIndices(indices.value))
const blockedUserIndices = computed(() => userIndices.value.filter((index) => index.blocks.length))
const selectedBlockedIndices = ref<string[]>([])
const blockedIndexOptions = computed(() =>
  blockedUserIndices.value.map((index) => ({ label: `${index.name} (${index.blocks.join(', ')})`, value: index.name }))
)
const selectedBlockedStates = computed(() =>
  blockedUserIndices.value.filter((index) => selectedBlockedIndices.value.includes(index.name))
)
const selectedUserBlockNames = computed<string[]>(() => [
  ...new Set<string>(
    selectedBlockedStates.value.flatMap((index) => index.blocks.filter((block) => block === 'write' || block === 'read_only'))
  )
])
const selectedHasFloodBlock = computed(() =>
  selectedBlockedStates.value.some((index) => index.blocks.includes('read_only_allow_delete'))
)

const watermarkLow = computed(() =>
  effectiveSetting<string>(settings.value, 'cluster.routing.allocation.disk.watermark.low', '85%')
)
const watermarkHigh = computed(() =>
  effectiveSetting<string>(settings.value, 'cluster.routing.allocation.disk.watermark.high', '90%')
)
const watermarkFlood = computed(() =>
  effectiveSetting<string>(settings.value, 'cluster.routing.allocation.disk.watermark.flood_stage', '95%')
)
const thresholdEnabled = computed(() =>
  effectiveSetting<string | boolean>(settings.value, 'cluster.routing.allocation.disk.threshold_enabled', true)
)
const lowMaxHeadroom = computed(() =>
  effectiveSetting<string>(settings.value, 'cluster.routing.allocation.disk.watermark.low.max_headroom', null)
)
const highMaxHeadroom = computed(() =>
  effectiveSetting<string>(settings.value, 'cluster.routing.allocation.disk.watermark.high.max_headroom', null)
)
const floodMaxHeadroom = computed(() =>
  effectiveSetting<string>(settings.value, 'cluster.routing.allocation.disk.watermark.flood_stage.max_headroom', null)
)
const watermarkDraft = reactive({ low: '85%', high: '90%', flood: '95%' })
const watermarkAdvanced = reactive({
  thresholdEnabled: true,
  lowMaxHeadroom: '',
  highMaxHeadroom: '',
  floodMaxHeadroom: ''
})
watch(
  [watermarkLow, watermarkHigh, watermarkFlood, thresholdEnabled, lowMaxHeadroom, highMaxHeadroom, floodMaxHeadroom],
  ([low, high, flood, threshold, lowHeadroom, highHeadroom, floodHeadroom]) => {
    watermarkDraft.low = String(low.effectiveValue || '85%')
    watermarkDraft.high = String(high.effectiveValue || '90%')
    watermarkDraft.flood = String(flood.effectiveValue || '95%')
    watermarkAdvanced.thresholdEnabled = threshold.effectiveValue !== false && threshold.effectiveValue !== 'false'
    watermarkAdvanced.lowMaxHeadroom = String(lowHeadroom.effectiveValue || '')
    watermarkAdvanced.highMaxHeadroom = String(highHeadroom.effectiveValue || '')
    watermarkAdvanced.floodMaxHeadroom = String(floodHeadroom.effectiveValue || '')
  },
  { immediate: true }
)
const watermarkValidation = computed(() => validateWatermarks(watermarkDraft))
const headroomError = computed(() => {
  if (!capabilities.maxHeadroom) return ''
  const invalid = [watermarkAdvanced.lowMaxHeadroom, watermarkAdvanced.highMaxHeadroom, watermarkAdvanced.floodMaxHeadroom].some(
    (value) => value.trim() && parseByteValue(value) === null
  )
  return invalid ? 'Max headroom values must use Elasticsearch byte units, for example 100gb.' : ''
})
const watermarksCustom = computed(() =>
  [
    watermarkLow.value,
    watermarkHigh.value,
    watermarkFlood.value,
    thresholdEnabled.value,
    lowMaxHeadroom.value,
    highMaxHeadroom.value,
    floodMaxHeadroom.value
  ].some((setting) => setting.source === 'persistent' || setting.source === 'transient')
)
const watermarkStatus = computed(() => (watermarksCustom.value ? 'Custom thresholds' : 'Defaults'))
const highestDiskNode = computed(
  () =>
    [...nodes.value]
      .filter((node) => node.diskUsedPercent != null)
      .sort((a, b) => (b.diskUsedPercent || 0) - (a.diskUsedPercent || 0))[0]
)
const diskSafeForFloodClear = computed<boolean | null>(() => {
  const flood = String(watermarkFlood.value.effectiveValue || '')
  if (!nodes.value.length) return null
  if (flood.endsWith('%')) {
    const threshold = Number(flood.slice(0, -1))
    if (!Number.isFinite(threshold) || nodes.value.some((node) => node.diskUsedPercent == null)) return null
    return nodes.value.every((node) => (node.diskUsedPercent || 0) < threshold)
  }
  const requiredFree = parseByteValue(flood)
  if (requiredFree == null || nodes.value.some((node) => node.diskAvailableBytes == null)) return null
  return nodes.value.every((node) => (node.diskAvailableBytes || 0) > requiredFree)
})
const clearUserBlocks = async () => {
  if (!selectedUserBlockNames.value.length) return
  const selected = selectedBlockedStates.value
    .filter((index) => index.blocks.some((block) => selectedUserBlockNames.value.includes(block)))
    .map((index) => index.name)
  if (
    await askConfirm(
      `Clear ${selectedUserBlockNames.value.join(' and ')} block(s) from ${selected.length} selected index/indices?\n\nFlood-stage blocks will not be changed.`
    )
  ) {
    await clearIndexBlocks(selected, selectedUserBlockNames.value)
  }
}
const clearFloodBlock = async () => {
  if (diskSafeForFloodClear.value !== true) return
  const selected = selectedBlockedStates.value
    .filter((index) => index.blocks.includes('read_only_allow_delete'))
    .map((index) => index.name)
  if (
    await askConfirm(
      `Clear recovered flood-stage write block from ${selected.length} index/indices?\n\nDisk usage currently appears below the flood-stage threshold. Elasticsearch normally removes this block automatically.`
    )
  ) {
    await clearIndexBlocks(selected, ['read_only_allow_delete'])
  }
}

const selectedReplicaIndices = ref<string[]>([])
const replicaDraft = ref(1)
const replicaIndexOptions = computed(() =>
  userIndices.value.map((index) => ({ label: `${index.name} (${index.replicas ?? 'unknown'} replicas)`, value: index.name }))
)
const selectedReplicaStates = computed(() =>
  userIndices.value.filter((index) => selectedReplicaIndices.value.includes(index.name))
)
const selectedReplicaCurrent = computed(() => {
  const values = new Set(selectedReplicaStates.value.map((index) => index.replicas))
  if (!values.size) return 'Select indices'
  return values.size === 1 ? `${[...values][0]}` : 'Mixed'
})
const replicaValid = computed(() => Number.isInteger(replicaDraft.value) && replicaDraft.value >= 0)
const singleNodeReplicaIndices = computed(() => indicesNeedingZeroReplicaHelper(indices.value, dataNodeCount.value))
const replicaStatus = computed(() =>
  singleNodeReplicaIndices.value.length
    ? `${singleNodeReplicaIndices.value.length} with unassigned replicas`
    : 'Configured per index'
)
const applyReplicas = async () => {
  if (!replicaValid.value || !selectedReplicaIndices.value.length) return
  const warning =
    replicaDraft.value === 0
      ? '\n\nZero replicas removes redundancy. A node failure may make data unavailable or cause data loss.'
      : ''
  if (await askConfirm(`Set ${selectedReplicaIndices.value.length} index/indices to ${replicaDraft.value} replicas?${warning}`)) {
    await setReplicas(selectedReplicaIndices.value, replicaDraft.value)
  }
}
const setSingleNodeReplicasToZero = async () => {
  const names = singleNodeReplicaIndices.value.map((index) => index.name)
  if (
    await askConfirm(
      `Set ${names.length} affected user index/indices to 0 replicas?\n\nThis will remove redundancy. Use this only when that trade-off is acceptable, such as a local development cluster.`
    )
  ) {
    await setReplicas(names, 0)
  }
}

const selectedRefreshIndices = ref<string[]>([])
const refreshDraft = ref('default')
const refreshCustom = ref('')
const refreshIndexOptions = computed(() =>
  userIndices.value.map((index) => ({
    label: `${index.name} (${index.refreshInterval || 'default'})`,
    value: index.name
  }))
)
const selectedRefreshStates = computed(() =>
  userIndices.value.filter((index) => selectedRefreshIndices.value.includes(index.name))
)
const selectedRefreshCurrent = computed(() => {
  const values = new Set(selectedRefreshStates.value.map((index) => index.refreshInterval || 'default'))
  if (!values.size) return 'Select indices'
  return values.size === 1 ? String([...values][0]) : 'Mixed'
})
const refreshDisabledCount = computed(() => userIndices.value.filter((index) => index.refreshInterval === '-1').length)
const refreshStatus = computed(() => {
  const values = new Set(userIndices.value.map((index) => index.refreshInterval || 'default'))
  if (!values.size) return 'No user indices'
  return values.size === 1 ? String([...values][0]) : 'Mixed intervals'
})
const refreshValid = computed(
  () =>
    refreshDraft.value === 'default' ||
    refreshDraft.value === '-1' ||
    (refreshDraft.value === 'custom' && /^\d+(?:\.\d+)?(?:ms|s|m|h)$/.test(refreshCustom.value))
)
const applyRefreshInterval = async () => {
  if (!selectedRefreshIndices.value.length || !refreshValid.value) return
  const value =
    refreshDraft.value === 'default' ? null : refreshDraft.value === 'custom' ? refreshCustom.value : refreshDraft.value
  const warning =
    value === '-1'
      ? '\n\nAutomatic refresh will be disabled. Newly indexed documents may not appear in search until a refresh occurs.'
      : ''
  if (
    await askConfirm(
      `Change the refresh interval for ${selectedRefreshIndices.value.length} index/indices to ${value ?? 'the Elasticsearch default'}?${warning}`
    )
  ) {
    await setRefreshInterval(selectedRefreshIndices.value, value)
  }
}

const applyWatermarks = async () => {
  if (!watermarkValidation.value.valid || headroomError.value) return
  if (
    !watermarkAdvanced.thresholdEnabled &&
    !(await askConfirm(
      'Disable disk allocation thresholds?\n\nElasticsearch will stop using disk usage to prevent allocation and flood-stage writes. Nodes may fill completely.'
    ))
  ) {
    return
  }
  if (
    await askConfirm(
      `Update disk watermarks?\n\nLow: ${watermarkLow.value.effectiveValue} → ${watermarkDraft.low}\nHigh: ${watermarkHigh.value.effectiveValue} → ${watermarkDraft.high}\nFlood stage: ${watermarkFlood.value.effectiveValue} → ${watermarkDraft.flood}`
    )
  ) {
    await setWatermarks(
      {
        ...watermarkDraft,
        thresholdEnabled: watermarkAdvanced.thresholdEnabled,
        lowMaxHeadroom: watermarkAdvanced.lowMaxHeadroom || null,
        highMaxHeadroom: watermarkAdvanced.highMaxHeadroom || null,
        floodMaxHeadroom: watermarkAdvanced.floodMaxHeadroom || null
      },
      capabilities
    )
  }
}
const restoreWatermarks = async () => {
  if (await askConfirm('Restore all three disk watermarks to Elasticsearch defaults by removing persistent overrides?')) {
    await setWatermarks(null, capabilities)
  }
}

const recoverySetting = computed(() => effectiveSetting<string>(settings.value, 'indices.recovery.max_bytes_per_sec', null))
const recoveryDraft = ref('')
watch(
  recoverySetting,
  (setting) => {
    recoveryDraft.value = setting.effectiveValue || ''
  },
  { immediate: true }
)
const recoveryValid = computed(() => /^\d+(?:\.\d+)?(?:b|kb|mb|gb|tb|pb)$/i.test(recoveryDraft.value))
const recoveryStatus = computed(() => recoverySetting.value.effectiveValue || 'Unavailable')
const applyRecoveryBandwidth = async () => {
  if (!recoveryValid.value) return
  await setClusterSettings(
    { 'indices.recovery.max_bytes_per_sec': recoveryDraft.value },
    `Recovery bandwidth set to ${recoveryDraft.value} per node.`
  )
}
const restoreRecoveryBandwidth = async () => {
  if (await askConfirm('Restore the recovery bandwidth limit to the Elasticsearch default?')) {
    await setClusterSettings({ 'indices.recovery.max_bytes_per_sec': null }, 'Recovery bandwidth restored to default.')
  }
}

const destructiveDefault = computed(() => {
  if (!connectionStore.elasticsearch) return true
  return Number.parseInt(connectionStore.activeCluster?.majorVersion || '0', 10) >= 8
})
const destructiveSetting = computed(() =>
  effectiveSetting<string | boolean>(settings.value, 'action.destructive_requires_name', destructiveDefault.value)
)
const destructiveEnabled = computed(
  () => destructiveSetting.value.effectiveValue !== false && destructiveSetting.value.effectiveValue !== 'false'
)
const setDestructiveProtection = async (enabled: boolean) => {
  if (
    !enabled &&
    !(await askConfirm(
      'Disable destructive operation protection?\n\nDestructive operations may target wildcards or all indices, increasing the risk of accidental data deletion.'
    ))
  )
    return
  await setClusterSettings(
    { 'action.destructive_requires_name': enabled },
    `Destructive operation protection ${enabled ? 'enabled' : 'disabled'}.`
  )
}
const restoreDestructiveProtection = () =>
  setClusterSettings({ 'action.destructive_requires_name': null }, 'Destructive operation protection restored to default.')

const autoCreateSetting = computed(() => effectiveSetting<string | boolean>(settings.value, 'action.auto_create_index', null))
const autoCreateMode = ref('default')
const autoCreateRules = ref('')
watch(
  autoCreateSetting,
  (setting) => {
    const value = setting.configuredValue
    if (value === null) autoCreateMode.value = 'default'
    else if (value === true || value === 'true') autoCreateMode.value = 'allow'
    else if (value === false || value === 'false') autoCreateMode.value = 'disable'
    else {
      autoCreateMode.value = 'custom'
      autoCreateRules.value = String(value)
    }
  },
  { immediate: true }
)
const autoCreateStatus = computed(() => {
  if (autoCreateSetting.value.source === 'default') return 'Elasticsearch default'
  if (autoCreateSetting.value.effectiveValue === false || autoCreateSetting.value.effectiveValue === 'false') return 'Disabled'
  if (autoCreateSetting.value.effectiveValue === true || autoCreateSetting.value.effectiveValue === 'true') return 'Allow all'
  return 'Custom rules'
})
const applyAutoCreate = async () => {
  const value =
    autoCreateMode.value === 'default'
      ? null
      : autoCreateMode.value === 'allow'
        ? true
        : autoCreateMode.value === 'disable'
          ? false
          : autoCreateRules.value
              .split(/[,\n]/)
              .map((rule) => rule.trim())
              .filter(Boolean)
              .join(',')
  if (autoCreateMode.value === 'custom' && !value) return
  if (
    autoCreateMode.value === 'disable' &&
    !(await askConfirm(
      'Disable automatic index creation?\n\nApplications and internal features that expect missing indices to be created may fail.'
    ))
  )
    return
  await setClusterSettings({ 'action.auto_create_index': value }, 'Automatic index creation updated.')
}

const clusterReadOnly = computed(() => effectiveSetting<string | boolean>(settings.value, 'cluster.blocks.read_only', false))
const clusterReadOnlyAllowDelete = computed(() =>
  effectiveSetting<string | boolean>(settings.value, 'cluster.blocks.read_only_allow_delete', false)
)
const isTrueSetting = (value: string | boolean | null) => value === true || value === 'true'
const clusterWriteMode = computed(() => {
  if (isTrueSetting(clusterReadOnly.value.effectiveValue)) return 'read_only'
  if (isTrueSetting(clusterReadOnlyAllowDelete.value.effectiveValue)) return 'allow_delete'
  return 'normal'
})
const clusterWriteDraft = ref('normal')
watch(clusterWriteMode, (value) => (clusterWriteDraft.value = value), { immediate: true })
const clusterWriteOptions = computed(() => [
  { label: 'Normal', value: 'normal' },
  { label: 'Read-only', value: 'read_only' },
  ...(capabilities.clusterReadOnlyAllowDelete ? [{ label: 'Read-only, allow index deletion', value: 'allow_delete' }] : [])
])
const applyClusterWriteMode = async () => {
  if (
    clusterWriteDraft.value !== 'normal' &&
    !(await askConfirm(
      `Make the entire cluster ${clusterWriteDraft.value === 'read_only' ? 'read-only' : 'read-only while allowing index deletion'}?\n\nIndex writes and metadata changes will be blocked across the cluster.`
    ))
  )
    return
  await setClusterSettings(
    {
      'cluster.blocks.read_only': clusterWriteDraft.value === 'read_only' ? true : null,
      'cluster.blocks.read_only_allow_delete': clusterWriteDraft.value === 'allow_delete' ? true : null
    },
    clusterWriteDraft.value === 'normal' ? 'Normal cluster write access restored.' : 'Cluster write mode updated.'
  )
}

const masterEligibleNodes = computed(() =>
  nodes.value.filter((node) => node.roles.includes('master') || node.roles.includes('cluster_manager'))
)
const selectedVotingNodeIds = ref<string[]>([])
const votingNodeOptions = computed(() =>
  masterEligibleNodes.value.map((node) => ({ label: `${node.name} (${node.id})`, value: node.id }))
)
const applyVotingExclusions = async () => {
  if (!selectedVotingNodeIds.value.length) return
  if (
    await askConfirm(
      `Add ${selectedVotingNodeIds.value.length} master-eligible node(s) to voting configuration exclusions?\n\nThis is only needed for specific topology changes that remove at least half of the master-eligible nodes in a short period. It does not stop any node.`
    )
  ) {
    await addVotingExclusions(selectedVotingNodeIds.value)
  }
}
const clearAllVotingExclusions = async () => {
  if (
    await askConfirm(
      'Clear all voting configuration exclusions?\n\nElasticsearch will wait for excluded nodes to be removed before clearing.'
    )
  ) {
    await clearVotingExclusions()
  }
}

const awarenessSetting = computed(() =>
  effectiveSetting<string>(settings.value, 'cluster.routing.allocation.awareness.attributes', '')
)
const awarenessAttributes = computed(() =>
  String(awarenessSetting.value.effectiveValue || '')
    .split(',')
    .map((attribute) => attribute.trim())
    .filter(Boolean)
)
const awarenessRows = computed(() =>
  awarenessAttributes.value.map((attribute) => {
    const values = [...new Set(nodes.value.map((node) => node.attributes[attribute]).filter(Boolean))].sort()
    const forcedKey = `cluster.routing.allocation.awareness.force.${attribute}.values`
    const forced = effectiveSetting<string>(settings.value, forcedKey, '').effectiveValue
    return { attribute, values, forced: String(forced || '') }
  })
)

onMounted(async () => {
  await refresh()
  if (capabilities.votingExclusions) await loadVotingExclusions()
})
onBeforeUnmount(() => {
  if (drainTimer) clearInterval(drainTimer)
})
</script>

<style scoped>
.tools-json {
  max-height: 24rem;
  overflow: auto;
  padding: 1rem;
  white-space: pre-wrap;
  border-radius: 4px;
  background: var(--bg-default);
}

code {
  word-break: break-word;
}
</style>
