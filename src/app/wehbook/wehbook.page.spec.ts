import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WehbookPage } from './wehbook.page';

describe('WehbookPage', () => {
  let component: WehbookPage;
  let fixture: ComponentFixture<WehbookPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WehbookPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
