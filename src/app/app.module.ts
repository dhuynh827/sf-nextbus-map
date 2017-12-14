import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Import HttpClientModule from @angular/common/http
import {HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { SfMapComponent } from './sf-map/sf-map.component';

@NgModule({
  declarations: [
    AppComponent,
    SfMapComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent, SfMapComponent]
})
export class AppModule { }
