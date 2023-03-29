import { ELASTIC_CLIENT } from "@/consts.js"
import { DefaultClient } from "@/models/clients/DefaultClient";
import { DockerClient } from "@/models/clients/DockerClient";
export const ClientProvider = {
  getClient: (instance) => {
    switch(ELASTIC_CLIENT) {
      case 'docker':
        return new DockerClient(instance);
      default:
        return new DefaultClient(instance);
    }
  }
}

