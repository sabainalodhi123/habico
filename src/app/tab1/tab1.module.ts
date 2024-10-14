import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { HttpClientModule } from '@angular/common/http';
import { Tab1PageRoutingModule } from './tab1-routing.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getTagValue'
})
export class GetTagValuePipe implements PipeTransform {
  transform(value: any, key: string): any {
    // Check if the value is not undefined or null
    if (value && Array.isArray(value)) {
      // Find the tag with the matching key and return its value
      return value.find(tag => tag.key === key)?.value;
    } else {
      // Return a default value or throw an error if the value is not an array
      return null; // or throw new Error('Invalid input');
    }
  }
}
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule,
   HttpClientModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),Pipe
  ],
  declarations: [Tab1Page, GetTagValuePipe]
})
export class Tab1PageModule {}
