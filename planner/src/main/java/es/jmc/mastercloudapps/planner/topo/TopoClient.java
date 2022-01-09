package es.jmc.mastercloudapps.planner.topo;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "books", url = "http://localhost:8080/api/")
public interface TopoClient {

  @GetMapping("topographicdetails/{city}")
  TopoService.Landscape requestLandscape(@PathVariable String city);
}


