import * as types from "./mutation-types";

const mutations = {
  [types.SET_STEP_TYPE](state, newStep) {
    state.step = newStep;
  },
  [types.UPDATE_GROUP_PROFILE](state, newProfile) {
    state.groupProfile = newProfile;
  },
  [types.UPDATE_GROUP_MEMBER_LIST](state, newList) {
    state.memberList = newList;
  },
  [types.UPDATE_FORM_STATE](state, newState) {
    state.formState = newState;
  },
  [types.UPDATE_USER_SIG](state, sig) {
    state.userSig = sig;
  },
  [types.ADD_MEET](state, person) {
    state.haveMeet.push(person);
  },
};
export default mutations;
