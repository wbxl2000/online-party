<template>
  <el-container>
    <el-header>
      <Header />
    </el-header>
    <el-main>
      <!-- {{ step }} -->
      <div id="entryWrapper" v-if="step == 0">
        <Entry />
      </div>
      <div v-if="step == 1">
        <WaitingRoom />
      </div>
      <div v-if="step == 2">
        <PartyRTCRoom />
      </div>
      <div v-if="step == 3">
        <EndingRoom />
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { defineComponent } from "vue";
import Header from "./common/Header.vue";
import Entry from "./components/Entry.vue";
import WaitingRoom from "./components/WaitingRoom.vue";
import PartyRTCRoom from "./components/PartyRTCRoom.vue";
import EndingRoom from "./components/EndingRoom.vue";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "App",
  computed: {
    ...mapGetters(["step"]),
  },
  setup() {},
  components: {
    Header,
    Entry,
    WaitingRoom,
    PartyRTCRoom,
    EndingRoom,
  },
});
</script>

<style>
* {
  font-family: HarmonyOS_Sans_Regular;
  letter-spacing: 1px;
}
</style>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#entryWrapper {
  width: 100%;
  display: flex;
  flex-direction: columns;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
